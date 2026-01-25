import { type Slide, SlideType } from "./marxism101-types";

export const CURRICULUM: Slide[] = [
  {
    id: "intro-1",
    type: SlideType.TITLE,
    title: "Introduction to Marxism",
    subtitle:
      "A Guide to Historical Materialism, Capitalism, and Class Struggle",
  },
  {
    id: "intro-2",
    type: SlideType.CONTENT_SPLIT,
    title: "Who was Karl Marx?",
    content:
      "Karl Marx (1818-1883) was a German philosopher, economist, historian, sociologist, political theorist, journalist, and socialist revolutionary. Born in Trier, Germany, to a middle-class family, he studied law and philosophy.",
    bullets: [
      'Famous Works: "The Communist Manifesto" (1848) and "Das Kapital" (1867).',
      "Collaborated closely with Friedrich Engels.",
      "Critiqued the political economy of capitalism.",
      "His ideas became the foundation of modern socialist movements.",
    ],
  },
  {
    id: "concept-1",
    type: SlideType.CONCEPT_CARD,
    title: "Core Concept: Historical Materialism",
    keyConcept: {
      term: "Historical Materialism",
      definition:
        "A methodology used by Marxist historiographers that focuses on human societies and their development through history, arguing that history is the result of material conditions rather than ideas.",
      analogy:
        'Think of society like a building. The "Base" is the foundation (the economy, tools, factories, relations of production). The "Superstructure" is the rest of the building (law, politics, religion, art). The foundation determines the shape of the building.',
    },
  },
  {
    id: "concept-2",
    type: SlideType.CONTENT_TEXT,
    title: "Base and Superstructure",
    content:
      'Marx argued that the mode of production of material life conditions the social, political, and intellectual life process in general. "It is not the consciousness of men that determines their being, but, on the contrary, their social being that determines their consciousness."',
    bullets: [
      "Base: The forces and relations of production (employer-employee work conditions, division of labor, property relations).",
      "Superstructure: Culture, institutions, political power structures, roles, rituals, and state.",
      "Relationship: The base generally dominates, but the superstructure can influence the base.",
    ],
  },
  {
    id: "quote-1",
    type: SlideType.QUOTE,
    title: "On History",
    quote: {
      text: "The history of all hitherto existing society is the history of class struggles.",
      author: "Karl Marx & Friedrich Engels",
      source: "The Communist Manifesto",
    },
  },
  {
    id: "concept-3",
    type: SlideType.CONTENT_SPLIT,
    title: "The Class Struggle",
    content: "In capitalism, society is splitting into two great hostile camps:",
    bullets: [
      "The Bourgeoisie: The capitalist class who own most of society's wealth and means of production.",
      "The Proletariat: The working class who do not own the means of production and must sell their labor power to survive.",
      "Conflict: The interests of these two classes are diametrically opposed. Profit comes from keeping wages low.",
    ],
  },
  {
    id: "concept-4",
    type: SlideType.CONCEPT_CARD,
    title: "Core Concept: Alienation",
    keyConcept: {
      term: "Alienation (Entfremdung)",
      definition:
        "The process whereby the worker is made to feel foreign to the products of his/her own labor.",
      analogy:
        'Imagine a carpenter who builds beautiful chairs but cannot afford to buy them, and has no say in how they are designed or sold. They become just a "cog in the machine," disconnected from their creativity and humanity.',
    },
  },
  {
    id: "quiz-1",
    type: SlideType.QUIZ,
    title: "Knowledge Check",
    quiz: {
      question:
        "According to Historical Materialism, what primarily drives historical change?",
      options: [
        {
          id: "a",
          text: "Great leaders and their ideas",
          isCorrect: false,
          explanation:
            "Marx argued against the 'Great Man' theory of history.",
        },
        {
          id: "b",
          text: "Material economic conditions",
          isCorrect: true,
          explanation:
            "Correct! The mode of production and material conditions are the primary drivers.",
        },
        {
          id: "c",
          text: "Divine intervention",
          isCorrect: false,
          explanation:
            "Marxism is a materialist philosophy, rejecting supernatural causes.",
        },
        {
          id: "d",
          text: "Legal reforms",
          isCorrect: false,
          explanation:
            "Laws are part of the 'superstructure', which is shaped by the material base.",
        },
      ],
    },
  },
  {
    id: "concept-5",
    type: SlideType.CONTENT_TEXT,
    title: "Surplus Value & Exploitation",
    content:
      'Where does profit come from? Marx argues it comes from "Surplus Value".',
    bullets: [
      "Labor creates value.",
      "Workers are paid a wage that covers their cost of living.",
      "However, they produce more value during the workday than what they are paid.",
      "The difference (Surplus Value) is kept by the capitalist as profit.",
      "This is the fundamental mechanism of exploitation in capitalism.",
    ],
  },
  {
    id: "conclusion",
    type: SlideType.TITLE,
    title: "Conclusion",
    subtitle: "You have completed the introductory module.",
    content:
      "This guide covered the basics: Historical Materialism, Class Struggle, Alienation, and Surplus Value. Continue exploring the library to deepen your understanding!",
  },
];
