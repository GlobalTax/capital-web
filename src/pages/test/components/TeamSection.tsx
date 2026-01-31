import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import teamMember1 from '@/assets/test/team-member-1.jpg';
import teamMember2 from '@/assets/test/team-member-2.jpg';
import teamMember3 from '@/assets/test/team-member-3.jpg';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Antonio García',
    role: 'Socio Director',
    image: teamMember1,
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'María López',
    role: 'Directora de M&A',
    image: teamMember2,
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Carlos Ruiz',
    role: 'Director de Valoraciones',
    image: teamMember3,
    linkedin: 'https://linkedin.com',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const TeamSection: React.FC = () => {
  return (
    <section id="equipo" className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20 text-center"
        >
          <span className="text-slate-400 text-sm tracking-[0.2em] uppercase block mb-4">
            Equipo
          </span>
          <h2 className="font-serif text-slate-900 text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Profesionales comprometidos
            <br />
            <span className="text-slate-500">con profesionales</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Un equipo multidisciplinar con experiencia en banca de inversión, private equity, consultoría estratégica y asesoría fiscal.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={cardVariants}
              className="group text-center"
            >
              {/* Photo Container */}
              <div className="relative overflow-hidden mb-6 aspect-[3/4] bg-slate-200">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all duration-500" />
                
                {/* LinkedIn icon on hover */}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                    aria-label={`LinkedIn de ${member.name}`}
                  >
                    <Linkedin className="w-5 h-5 text-slate-700" />
                  </a>
                )}
              </div>

              {/* Name & Role */}
              <h3 className="font-serif text-slate-900 text-xl md:text-2xl mb-2">
                {member.name}
              </h3>
              <p className="text-slate-500 text-sm tracking-wide">
                {member.role}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <a
            href="/equipo"
            className="inline-flex items-center gap-3 px-8 py-4 border border-slate-300 text-slate-900 text-sm font-medium tracking-wide hover:bg-slate-100 transition-colors"
          >
            Ver equipo completo
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
