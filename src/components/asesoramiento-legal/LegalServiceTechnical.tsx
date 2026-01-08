import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';

const LegalServiceTechnical = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-4xl font-normal text-foreground">
              Asesoramiento Legal M&A
            </h1>
            <Badge variant="secondary" className="text-xs">
              Última actualización: Agosto 2025
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-4xl">
            Servicio legal especializado en operaciones de compraventa empresarial: due diligence jurídico, 
            estructuración contractual, gestión de disclosure y mitigación de contingencias legales.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="alcance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 mb-8">
            <TabsTrigger value="alcance">Alcance</TabsTrigger>
            <TabsTrigger value="metodologia">Metodología</TabsTrigger>
            <TabsTrigger value="entregables">Entregables</TabsTrigger>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
            <TabsTrigger value="sla-precios">SLA & Precios</TabsTrigger>
            <TabsTrigger value="riesgos">Riesgos</TabsTrigger>
            <TabsTrigger value="raci">RACI</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Tab: Alcance */}
          <TabsContent value="alcance" className="mt-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    Buy-Side Legal Advisory
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Due diligence jurídico integral</li>
                    <li>• Revisión de disclosure letter</li>
                    <li>• Negociación de warranties & indemnities</li>
                    <li>• Estructuración de SPA/APA</li>
                    <li>• Gestión de condiciones precedentes</li>
                  </ul>
                </div>
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    Sell-Side Legal Advisory
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Preparación de data room legal</li>
                    <li>• Legal vendor due diligence</li>
                    <li>• Drafting de disclosure letter</li>
                    <li>• Negociación de términos legales</li>
                    <li>• Gestión de signing & closing</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted/30 border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Límites del Servicio</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-2">Incluido:</p>
                    <ul className="space-y-1">
                      <li>• Asesoramiento legal M&A</li>
                      <li>• Documentación contractual</li>
                      <li>• Due diligence jurídico</li>
                      <li>• Gestión regulatoria M&A</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Excluido:</p>
                    <ul className="space-y-1">
                      <li>• Litigios pre-existentes</li>
                      <li>• Asesoramiento fiscal específico</li>
                      <li>• Registro mercantil operativo</li>
                      <li>• Gestión laboral post-closing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Metodología */}
          <TabsContent value="metodologia" className="mt-6">
            <div className="space-y-6">
              {[
                {
                  phase: "Kick-off & Planning",
                  duration: "Semana 1",
                  activities: [
                    "Análisis de transaction structure",
                    "Definición de legal workstreams",
                    "Setup de data room access",
                    "Planning de due diligence scope"
                  ],
                  deliverables: ["Legal DD Plan", "Checklist de documentación", "Risk assessment inicial"]
                },
                {
                  phase: "Due Diligence Execution",
                  duration: "Semanas 2-4",
                  activities: [
                    "Revisión exhaustiva de contratos principales",
                    "Análisis de contingencias legales",
                    "Verificación de compliance regulatorio",
                    "Assessment de estructura societaria"
                  ],
                  deliverables: ["DD Report", "Red flags summary", "Risk matrix"]
                },
                {
                  phase: "Documentation & Negotiation",
                  duration: "Semanas 5-7",
                  activities: [
                    "Drafting de SPA/APA principal",
                    "Negociación de warranties",
                    "Estructuración de indemnities",
                    "Condiciones precedentes"
                  ],
                  deliverables: ["SPA/APA", "Disclosure Letter", "Ancillary agreements"]
                },
                {
                  phase: "Signing & Closing",
                  duration: "Semana 8",
                  activities: [
                    "Coordinación de signing process",
                    "Gestión de conditions precedent",
                    "Closing mechanics execution",
                    "Post-closing obligations setup"
                  ],
                  deliverables: ["Signed agreements", "Closing memorandum", "Post-closing playbook"]
                }
              ].map((phase, index) => (
                <div key={index} className="bg-card border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{phase.phase}</h3>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Actividades Clave</h4>
                      <ul className="space-y-1 text-sm">
                        {phase.activities.map((activity, idx) => (
                          <li key={idx}>• {activity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Entregables</h4>
                      <ul className="space-y-1 text-sm">
                        {phase.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Entregables */}
          <TabsContent value="entregables" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="red-flags">
                <AccordionTrigger>Red Flags Report & Risk Assessment</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Identificación y análisis de contingencias legales críticas</p>
                    <ul className="space-y-2 text-sm">
                      <li>• Material litigation exposure</li>
                      <li>• Regulatory compliance gaps</li>
                      <li>• IP infringement risks</li>
                      <li>• Material contracts vulnerabilities</li>
                      <li>• Corporate governance deficiencies</li>
                      <li>• Employment law contingencies</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="risk-matrix">
                <AccordionTrigger>Legal Risk Matrix & Mitigation Plan</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Riesgo</TableHead>
                          <TableHead>Probabilidad</TableHead>
                          <TableHead>Impacto</TableHead>
                          <TableHead>Mitigación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Contingencias fiscales</TableCell>
                          <TableCell>Media</TableCell>
                          <TableCell>Alto</TableCell>
                          <TableCell>Tax warranty específico</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Litigios ocultos</TableCell>
                          <TableCell>Baja</TableCell>
                          <TableCell>Alto</TableCell>
                          <TableCell>Disclosure completo</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contracts">
                <AccordionTrigger>Contratos Principales & Ancillary Agreements</AccordionTrigger>
                <AccordionContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Contratos Principales</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Share Purchase Agreement (SPA)</li>
                        <li>• Asset Purchase Agreement (APA)</li>
                        <li>• Disclosure Letter</li>
                        <li>• Escrow Agreement</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Acuerdos Auxiliares</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Transition Services Agreement</li>
                        <li>• Employment Agreements</li>
                        <li>• Non-compete & Non-solicitation</li>
                        <li>• IP Assignment Agreements</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="closing">
                <AccordionTrigger>Closing Checklist & Post-Closing Playbook</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pre-Closing Requirements</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Satisfaction of conditions precedent</li>
                        <li>• Regulatory approvals obtained</li>
                        <li>• Third-party consents secured</li>
                        <li>• Financing arrangements confirmed</li>
                      </ul>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Post-Closing Actions</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Corporate integration steps</li>
                        <li>• Warranty claims management</li>
                        <li>• Earn-out calculations</li>
                        <li>• Escrow release procedures</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Tab: Checklists */}
          <TabsContent value="checklists" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="data-room">
                <AccordionTrigger>Legal Data Room Setup & Management</AccordionTrigger>
                <AccordionContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Corporate Documents</h4>
                      <ul className="space-y-1 text-xs">
                        <li>□ Escrituras de constitución</li>
                        <li>□ Estatutos sociales vigentes</li>
                        <li>□ Libros sociales (3 años)</li>
                        <li>□ Actas de JG y CA relevantes</li>
                        <li>□ Poderes notariales vigentes</li>
                        <li>□ Certificados registrales</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Contratos Principales</h4>
                      <ul className="space-y-1 text-xs">
                        <li>□ Contratos de distribución</li>
                        <li>□ Acuerdos de suministro</li>
                        <li>□ Contratos de arrendamiento</li>
                        <li>□ Acuerdos de financiación</li>
                        <li>□ Seguros corporativos</li>
                        <li>□ Contratos IT & IP</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="disclosure">
                <AccordionTrigger>Disclosure Letter Preparation</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Disclosure Categories</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1">
                          <li>□ Material litigation</li>
                          <li>□ Regulatory investigations</li>
                          <li>□ Tax contingencies</li>
                          <li>□ Environmental liabilities</li>
                        </ul>
                        <ul className="space-y-1">
                          <li>□ Employment disputes</li>
                          <li>□ IP infringement claims</li>
                          <li>□ Material contracts breaches</li>
                          <li>□ Related party transactions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="locked-box">
                <AccordionTrigger>Locked Box vs. Completion Accounts</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aspecto</TableHead>
                        <TableHead>Locked Box</TableHead>
                        <TableHead>Completion Accounts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Price certainty</TableCell>
                        <TableCell>Alta (fecha fija)</TableCell>
                        <TableCell>Baja (ajustes post)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Legal complexity</TableCell>
                        <TableCell>Leakage provisions</TableCell>
                        <TableCell>Working capital mechanisms</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Due diligence focus</TableCell>
                        <TableCell>Historical compliance</TableCell>
                        <TableCell>Current position analysis</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Tab: Plantillas */}
          <TabsContent value="plantillas" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  category: "Pre-Contractual",
                  templates: [
                    "Letter of Intent (LOI) Template",
                    "Term Sheet Template",
                    "Confidentiality Agreement (NDA)",
                    "Process Letter Template"
                  ]
                },
                {
                  category: "Main Agreements",
                  templates: [
                    "Share Purchase Agreement (SPA)",
                    "Asset Purchase Agreement (APA)", 
                    "Disclosure Letter Template",
                    "Escrow Agreement Template"
                  ]
                },
                {
                  category: "Ancillary Documents",
                  templates: [
                    "Transition Services Agreement",
                    "Employment Agreement Template",
                    "Non-compete Agreement",
                    "Warranty & Indemnity Insurance"
                  ]
                },
                {
                  category: "Closing Documents",
                  templates: [
                    "Closing Checklist Template",
                    "Corporate Resolutions",
                    "Officer's Certificate",
                    "Legal Opinion Template"
                  ]
                }
              ].map((section, index) => (
                <div key={index} className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
                  <ul className="space-y-2">
                    {section.templates.map((template, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        {template}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab: SLA & Precios */}
          <TabsContent value="sla-precios" className="mt-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Service Level Agreements</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deliverable</TableHead>
                      <TableHead>Standard Timeline</TableHead>
                      <TableHead>Rush Timeline</TableHead>
                      <TableHead>Quality Standard</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Initial DD Report</TableCell>
                      <TableCell>10 días laborables</TableCell>
                      <TableCell>5 días laborables</TableCell>
                      <TableCell>Partner review + QC</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SPA First Draft</TableCell>
                      <TableCell>7 días laborables</TableCell>
                      <TableCell>3 días laborables</TableCell>
                      <TableCell>Senior associate draft</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Disclosure Letter</TableCell>
                      <TableCell>5 días laborables</TableCell>
                      <TableCell>48 horas</TableCell>
                      <TableCell>Complete disclosure</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Closing Support</TableCell>
                      <TableCell>24/7 availability</TableCell>
                      <TableCell>24/7 availability</TableCell>
                      <TableCell>Real-time support</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Modelos de Precio</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Retainer + Success Fee</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Monthly retainer: €15-25k</li>
                      <li>• Success fee: 0.5-1% transaction value</li>
                      <li>• Minimum fee: €75k</li>
                      <li>• Cap: €500k</li>
                    </ul>
                  </div>
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Fixed Fee</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Small deals (&lt;€10M): €40-75k</li>
                      <li>• Mid market (€10-100M): €75-200k</li>
                      <li>• Large deals (&gt;€100M): €200-500k</li>
                      <li>• Complex structures: +25-50%</li>
                    </ul>
                  </div>
                  <div className="bg-card border rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Time & Materials</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Partner: €800-1,200/hour</li>
                      <li>• Senior Associate: €500-700/hour</li>
                      <li>• Associate: €300-500/hour</li>
                      <li>• Paralegal: €150-250/hour</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Riesgos */}
          <TabsContent value="riesgos" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Risk Register & Mitigation Matrix</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk Category</TableHead>
                    <TableHead>Risk Description</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Mitigation Strategy</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Disclosure</TableCell>
                    <TableCell>Incomplete or inaccurate disclosure</TableCell>
                    <TableCell>Media</TableCell>
                    <TableCell>Alto</TableCell>
                    <TableCell>Comprehensive DD + warranty coverage</TableCell>
                    <TableCell>Legal Team</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Regulatory</TableCell>
                    <TableCell>Competition law clearance delays</TableCell>
                    <TableCell>Baja</TableCell>
                    <TableCell>Alto</TableCell>
                    <TableCell>Early filing + antitrust counsel</TableCell>
                    <TableCell>Regulatory</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contractual</TableCell>
                    <TableCell>Material adverse change clause trigger</TableCell>
                    <TableCell>Baja</TableCell>
                    <TableCell>Crítico</TableCell>
                    <TableCell>Narrow MAC definition + carve-outs</TableCell>
                    <TableCell>Legal Team</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Financing</TableCell>
                    <TableCell>Debt financing not available at closing</TableCell>
                    <TableCell>Media</TableCell>
                    <TableCell>Crítico</TableCell>
                    <TableCell>Financing contingency + backup facilities</TableCell>
                    <TableCell>Corporate Finance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Integration</TableCell>
                    <TableCell>Key employees departure post-closing</TableCell>
                    <TableCell>Alta</TableCell>
                    <TableCell>Media</TableCell>
                    <TableCell>Retention packages + non-compete</TableCell>
                    <TableCell>HR</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab: RACI */}
          <TabsContent value="raci" className="mt-6">
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">RACI Matrix - Legal Workstreams</h3>
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium">R</span>=Responsible | <span className="font-medium">A</span>=Accountable | <span className="font-medium">C</span>=Consulted | <span className="font-medium">I</span>=Informed
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Legal Activity</TableHead>
                    <TableHead>Legal Partner</TableHead>
                    <TableHead>Sr. Associate</TableHead>
                    <TableHead>Junior Associate</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Capittal Team</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Due Diligence Strategy</TableCell>
                    <TableCell><Badge variant="outline">A</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">I</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DD Report Preparation</TableCell>
                    <TableCell><Badge variant="outline">A</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">I</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SPA/APA Drafting</TableCell>
                    <TableCell><Badge variant="outline">A</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contract Negotiation</TableCell>
                    <TableCell><Badge variant="outline">A/R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">I</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Disclosure Preparation</TableCell>
                    <TableCell><Badge variant="outline">A</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">I</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Regulatory Approvals</TableCell>
                    <TableCell><Badge variant="outline">A</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Closing Coordination</TableCell>
                    <TableCell><Badge variant="outline">A</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">R</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                    <TableCell><Badge variant="outline">C</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab: FAQ */}
          <TabsContent value="faq" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>¿Cuál es la diferencia entre warranty coverage y indemnity?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm mb-3">
                    Las warranties son declaraciones sobre el estado de la empresa en el momento del signing, 
                    mientras que las indemnities son compromisos de compensación por pérdidas específicas.
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Warranties:</strong> Knowledge qualification, materiality thresholds, disclosure baskets</li>
                    <li>• <strong>Indemnities:</strong> Specific risks, uncapped liability, survival periods</li>
                    <li>• <strong>Interacción:</strong> Indemnities normalmente prevalecen sobre warranties generales</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger>¿Cómo se estructuran las condiciones precedentes en operaciones complejas?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>Las conditions precedent se clasifican en mutuas y unilaterales:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Mutuas:</p>
                        <ul className="text-xs space-y-1">
                          <li>• No material adverse change</li>
                          <li>• Regulatory approvals</li>
                          <li>• Third-party consents</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Del comprador:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Financing availability</li>
                          <li>• DD satisfactory completion</li>
                          <li>• Key employees retention</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger>¿Qué aspectos clave incluir en el management presentation legal?</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm space-y-2">
                    <li>• <strong>Corporate structure:</strong> Shareholding charts, subsidiary relationships</li>
                    <li>• <strong>Material contracts:</strong> Key customer/supplier agreements, terms & conditions</li>
                    <li>• <strong>Intellectual property:</strong> Patents, trademarks, licensing agreements</li>
                    <li>• <strong>Regulatory environment:</strong> Licenses, permits, compliance status</li>
                    <li>• <strong>Litigation & claims:</strong> Current disputes, potential exposures</li>
                    <li>• <strong>Employment:</strong> Key personnel, collective agreements, pension obligations</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger>¿Cuándo es recomendable usar W&I insurance en lugar de seller warranty?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>W&I Insurance es especialmente útil en:</p>
                    <ul className="space-y-1">
                      <li>• <strong>Auction processes:</strong> Competitive advantage vs otros bidders</li>
                      <li>• <strong>PE exits:</strong> Clean exit para el fondo, limited seller warranty</li>
                      <li>• <strong>Cross-border deals:</strong> Enforcement challenges en jurisdicciones extranjeras</li>
                      <li>• <strong>Management involvement:</strong> Cuando management continúa post-closing</li>
                      <li>• <strong>Limited seller covenant:</strong> Seller con recursos limitados para warranties</li>
                    </ul>
                    <div className="mt-3 p-3 bg-muted/30 rounded text-xs">
                      <strong>Consideración de costes:</strong> Premium 1-2% del coverage, más due diligence costs del insurer
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger>¿Cómo gestionar el disclosure process de manera eficiente?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>Metodología estructurada para disclosure management:</p>
                    <ol className="list-decimal list-inside space-y-2 text-xs">
                      <li><strong>Disclosure schedule creation:</strong> Map warranties to specific disclosure categories</li>
                      <li><strong>Information gathering:</strong> Client questionnaires, management interviews</li>
                      <li><strong>Document review:</strong> Support documentation for each disclosure item</li>
                      <li><strong>Legal assessment:</strong> Materiality analysis, risk quantification</li>
                      <li><strong>Disclosure letter drafting:</strong> Clear, comprehensive, legally defensible</li>
                      <li><strong>Negotiation strategy:</strong> General vs specific disclosure, bundling approach</li>
                    </ol>
                    <div className="mt-3 p-3 bg-muted/30 rounded">
                      <p className="font-medium text-xs">Best practice:</p>
                      <p className="text-xs">Disclosure contra specific warranty paragraph, no general catch-all disclosures</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegalServiceTechnical;