import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      templateUrl,
      operationsBase64,
      sectionInsertPoints,
      sectionSlideCounts: clientSlideCounts,
      skipSlides,
    } = await req.json();

    if (!templateUrl || !operationsBase64 || !sectionInsertPoints) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Download & parse both PPTX files
    const templateResp = await fetch(templateUrl);
    if (!templateResp.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to download template: ${templateResp.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const tplZip = await JSZip.loadAsync(await templateResp.arrayBuffer());
    const opsBytes = Uint8Array.from(atob(operationsBase64), c => c.charCodeAt(0));
    const opsZip = await JSZip.loadAsync(opsBytes);

    // 2. Determine which template slides to keep (skip placeholder slides)
    const allTplSlideNums = getSlideNums(tplZip);
    const toSkip = new Set<number>(Array.isArray(skipSlides) ? skipSlides : []);
    const keptTplSlideNums = allTplSlideNums.filter(n => !toSkip.has(n));
    console.log(`Template slides: ${allTplSlideNums.join(',')}, skipping: ${[...toSkip].join(',')}, keeping: ${keptTplSlideNums.join(',')}`);

    // 3. Build section slide counts
    const sectionCounts: Record<string, number> = clientSlideCounts || {};
    if (!clientSlideCounts) {
      const keys = Object.keys(sectionInsertPoints);
      const opsTotal = getSlideNums(opsZip).length;
      const per = Math.floor(opsTotal / keys.length);
      const rem = opsTotal % keys.length;
      keys.forEach((k, i) => { sectionCounts[k] = per + (i < rem ? 1 : 0); });
    }

    // 4. Adjust insert points for skipped slides
    // Original insert points reference the ORIGINAL template slide numbers
    // After removing skipped slides, positions shift down
    const adjustedInsertPoints: Record<string, number> = {};
    for (const [key, origPos] of Object.entries(sectionInsertPoints as Record<string, number>)) {
      // New position = origPos minus count of skipped slides before it
      const skippedBefore = [...toSkip].filter(s => s < origPos).length;
      // Also check if the insert point itself was skipped
      const wasSkipped = toSkip.has(origPos);
      adjustedInsertPoints[key] = wasSkipped ? origPos - skippedBefore - 1 : origPos - skippedBefore;
    }
    console.log(`Adjusted insert points:`, JSON.stringify(adjustedInsertPoints));

    // 5. Build final slide order
    const opsSlideNums = getSlideNums(opsZip);
    if (opsSlideNums.length === 0) {
      // No ops, just return template without skipped slides
      const result = await rebuildPptx(tplZip, keptTplSlideNums.map(n => ({ source: 'template' as const, num: n })), tplZip, opsZip);
      return jsonBase64Response(result);
    }

    // Sort insert entries by position ascending
    const insertEntries = Object.entries(adjustedInsertPoints)
      .filter(([key]) => (sectionCounts[key] || 0) > 0)
      .sort((a, b) => a[1] - b[1]);

    // Build insert-after map: keptPosition -> sectionKey
    const insertAfterMap = new Map<number, string>();
    for (const [key, pos] of insertEntries) {
      insertAfterMap.set(pos, key);
    }

    const finalSlides: Array<{ source: 'template' | 'ops'; num: number }> = [];
    let opsOffset = 0;

    keptTplSlideNums.forEach((origNum, idx) => {
      const keptPos = idx + 1; // 1-based position in the kept list
      finalSlides.push({ source: 'template', num: origNum });

      if (insertAfterMap.has(keptPos)) {
        const sectionKey = insertAfterMap.get(keptPos)!;
        const count = sectionCounts[sectionKey] || 0;
        for (let j = 0; j < count; j++) {
          finalSlides.push({ source: 'ops', num: opsSlideNums[opsOffset + j] });
        }
        opsOffset += count;
      }
    });

    console.log(`Final slide order: ${finalSlides.map(s => `${s.source[0]}${s.num}`).join(', ')} (${finalSlides.length} total)`);

    // 6. Build merged PPTX
    const mergedBuffer = await rebuildPptx(tplZip, finalSlides, tplZip, opsZip);
    return jsonBase64Response(mergedBuffer);

  } catch (error) {
    console.error('merge-pptx error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── HELPERS ───

function getSlideNums(zip: JSZip): number[] {
  return Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .map(f => parseInt(f.match(/slide(\d+)/)?.[1] || '0'))
    .sort((a, b) => a - b);
}

/**
 * Rebuild a PPTX from scratch with the given slide order.
 * This approach avoids rId conflicts by:
 * 1. Reading ALL existing non-slide relationships from presentation.xml.rels
 * 2. Finding the max rId number
 * 3. Assigning new rIds for slides starting after the max
 * 4. For ops slides, rewriting their .rels to reference the template's slideLayout
 */
async function rebuildPptx(
  tplZip: JSZip,
  finalSlides: Array<{ source: 'template' | 'ops'; num: number }>,
  _tplZip: JSZip,
  opsZip: JSZip,
): Promise<ArrayBuffer> {
  const merged = new JSZip();

  // Copy everything from template EXCEPT slides and their rels
  const slideFileRe = /^ppt\/slides\/slide\d+\.xml$/;
  const slideRelRe = /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/;

  for (const [path, file] of Object.entries(tplZip.files)) {
    if (slideFileRe.test(path) || slideRelRe.test(path)) continue;
    if ((file as any).dir) continue;
    merged.file(path, await (file as any).async('arraybuffer'));
  }

  // Copy ops media files with unique names
  const tplMediaCount = Object.keys(tplZip.files).filter(f => f.startsWith('ppt/media/')).length;
  let mediaIdx = tplMediaCount + 1;
  const opsMediaRename = new Map<string, string>(); // "image1.png" -> "image_m7.png"

  for (const [path, file] of Object.entries(opsZip.files)) {
    if (path.startsWith('ppt/media/') && !(file as any).dir) {
      const oldName = path.replace('ppt/media/', '');
      const ext = oldName.split('.').pop() || 'png';
      const newName = `image_m${mediaIdx}.${ext}`;
      opsMediaRename.set(oldName, newName);
      merged.file(`ppt/media/${newName}`, await (file as any).async('arraybuffer'));
      mediaIdx++;
    }
  }

  // Find the first slideLayout path in the template to use for ops slides
  const tplLayoutPath = Object.keys(tplZip.files)
    .filter(f => /^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(f))
    .sort()[0] || 'ppt/slideLayouts/slideLayout1.xml';
  const tplLayoutRelTarget = '../' + tplLayoutPath.replace('ppt/', '');

  // Write slides in final order
  for (let i = 0; i < finalSlides.length; i++) {
    const entry = finalSlides[i];
    const newNum = i + 1;

    if (entry.source === 'template') {
      // Copy slide XML as-is (binary to preserve encoding)
      const xml = await tplZip.file(`ppt/slides/slide${entry.num}.xml`)?.async('arraybuffer');
      if (xml) merged.file(`ppt/slides/slide${newNum}.xml`, xml);

      const rels = await tplZip.file(`ppt/slides/_rels/slide${entry.num}.xml.rels`)?.async('arraybuffer');
      if (rels) merged.file(`ppt/slides/_rels/slide${newNum}.xml.rels`, rels);
    } else {
      // Ops slide: copy XML, rewrite media refs
      let xml = await opsZip.file(`ppt/slides/slide${entry.num}.xml`)?.async('string') || '';
      for (const [oldName, newName] of opsMediaRename) {
        xml = xml.replaceAll(oldName, newName);
      }
      merged.file(`ppt/slides/slide${newNum}.xml`, xml);

      // Rewrite ops slide rels to point to template's slideLayout
      let rels = await opsZip.file(`ppt/slides/_rels/slide${entry.num}.xml.rels`)?.async('string') || '';
      if (rels) {
        // Replace slideLayout target to use template's layout
        rels = rels.replace(
          /Target="[^"]*slideLayout[^"]*"/g,
          `Target="${tplLayoutRelTarget}"`
        );
        // Replace media references
        for (const [oldName, newName] of opsMediaRename) {
          rels = rels.replaceAll(oldName, newName);
        }
        merged.file(`ppt/slides/_rels/slide${newNum}.xml.rels`, rels);
      } else {
        // Create minimal rels pointing to template layout
        const minRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="${tplLayoutRelTarget}"/>
</Relationships>`;
        merged.file(`ppt/slides/_rels/slide${newNum}.xml.rels`, minRels);
      }
    }
  }

  // Rebuild presentation.xml.rels
  // CRITICAL: preserve all non-slide relationships with their original rIds
  let presRels = await tplZip.file('ppt/_rels/presentation.xml.rels')?.async('string') || '';

  // Extract all non-slide relationships
  const nonSlideRels: string[] = [];
  let maxRid = 0;
  const relRe = /<Relationship[^>]*\/>/g;
  let match;
  while ((match = relRe.exec(presRels)) !== null) {
    const rel = match[0];
    const isSlide = /Target="slides\/slide\d+\.xml"/.test(rel);
    if (!isSlide) {
      nonSlideRels.push(rel);
    }
    const ridMatch = rel.match(/Id="rId(\d+)"/);
    if (ridMatch) {
      maxRid = Math.max(maxRid, parseInt(ridMatch[1]));
    }
  }

  // Build new rels: keep all non-slide rels, add slides with rIds starting after maxRid
  const slideRids: string[] = [];
  let newPresRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${nonSlideRels.join('\n')}
`;
  for (let i = 0; i < finalSlides.length; i++) {
    const rid = `rId${maxRid + 1 + i}`;
    slideRids.push(rid);
    newPresRels += `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>\n`;
  }
  newPresRels += `</Relationships>`;
  merged.file('ppt/_rels/presentation.xml.rels', newPresRels);

  // Rebuild presentation.xml sldIdLst using the new rIds
  let presXml = await tplZip.file('ppt/presentation.xml')?.async('string') || '';

  // Find max existing sldId to avoid conflicts
  let maxSldId = 256;
  const sldIdRe = /id="(\d+)"/g;
  let sldMatch;
  while ((sldMatch = sldIdRe.exec(presXml)) !== null) {
    maxSldId = Math.max(maxSldId, parseInt(sldMatch[1]));
  }

  const hasSldIdLst = /<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/.test(presXml);
  let newSldIdLst = '<p:sldIdLst>';
  for (let i = 0; i < finalSlides.length; i++) {
    newSldIdLst += `<p:sldId id="${maxSldId + 1 + i}" r:id="${slideRids[i]}"/>`;
  }
  newSldIdLst += '</p:sldIdLst>';

  if (hasSldIdLst) {
    presXml = presXml.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, newSldIdLst);
  }
  merged.file('ppt/presentation.xml', presXml);

  // Update [Content_Types].xml
  let ct = await tplZip.file('[Content_Types].xml')?.async('string') || '';
  ct = ct.replace(/<Override[^>]*PartName="\/ppt\/slides\/slide\d+\.xml"[^>]*\/>/g, '');
  let overrides = '';
  for (let i = 1; i <= finalSlides.length; i++) {
    overrides += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  ct = ct.replace('</Types>', overrides + '</Types>');
  merged.file('[Content_Types].xml', ct);

  return await merged.generateAsync({ type: 'arraybuffer' });
}

function jsonBase64Response(buffer: ArrayBuffer): Response {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
  }
  return new Response(
    JSON.stringify({ mergedPptxBase64: btoa(binary) }),
    { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version', 'Content-Type': 'application/json' } }
  );
}
