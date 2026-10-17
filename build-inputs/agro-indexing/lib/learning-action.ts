import type { KnowledgeArticle } from '@/lib/articles';

export function learningAction(tutorial: KnowledgeArticle['tutorial']) {
  if (tutorial?.targetHref === '/juego-finca') {
    return {
      kicker: 'EXPLORA FINCA ESCUELA',
      title: 'Aprende con la práctica.',
      description: 'Actividades ficticias con progreso local, separadas de Mi Finca y de tus registros reales.',
    };
  }
  if (tutorial) {
    return {
      kicker: 'CONTINÚA CON LA GUÍA',
      title: 'Pon en práctica estos pasos.',
      description: 'Abre la herramienta correspondiente y comprueba las opciones y el resultado que muestra.',
    };
  }
  return {
    kicker: 'LLEVA EL REGISTRO',
    title: 'Del aprendizaje a la acción.',
    description: 'Configura tu finca y conserva los cambios en el dispositivo, incluso sin señal.',
  };
}
