export interface GuideSectionContent {
  intro: string;
  paragraphs: string[];
  keyTakeaway: string;
}

export interface GuideRelatedConfig {
  videoTags: string[];
  videoCategories?: string[];
  bookAuthors: string[];
  bookTags: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  eyebrow: string;
  content: GuideSectionContent;
  related: GuideRelatedConfig;
}

export const guideSections: GuideSection[] = [
  {
    id: "what-is-marxism",
    title: "What is Marxism?",
    eyebrow: "Step 1 of 7",
    content: {
      intro:
        "Marxism is a way of understanding society that asks a simple but powerful question: who controls the material resources of life, and how does that shape everything else? It begins from the premise that people make their history under conditions they did not choose, and that those conditions are rooted in how production is organized.",
      paragraphs: [
        "Rather than treating politics, culture, and ideas as the engine of change, Marxism focuses on the material foundations of society: the tools, resources, and social relationships that make production possible. This is not a claim that ideas do not matter. It is a claim that ideas tend to reflect the interests and realities of the social groups that hold economic power. When the economy shifts, social institutions and dominant beliefs often shift with it.",
        "Marxism is also a critical framework. It does not only describe capitalism; it evaluates its contradictions and the conflicts it produces. It studies how wage labor, markets, and private ownership generate growth and innovation while also creating instability, inequality, and crisis. The goal is not nostalgia for the past but clarity about the present, and a willingness to ask how society could be organized in a more just and democratic way.",
      ],
      keyTakeaway:
        "Marxism is a materialist, critical framework for understanding how economic power shapes society and how change becomes possible.",
    },
    related: {
      videoTags: ["marx", "marxism", "introduction", "theory"],
      videoCategories: ["Theory", "Introduction", "Political Economy"],
      bookAuthors: ["Karl Marx", "Friedrich Engels"],
      bookTags: ["marxism", "theory", "introduction"],
    },
  },
  {
    id: "historical-materialism",
    title: "Historical Materialism",
    eyebrow: "Step 2 of 7",
    content: {
      intro:
        "Historical materialism is the method Marx and Engels used to explain why societies change over time. It argues that the core driver of social transformation is the development of productive forces and the conflicts that arise around them.",
      paragraphs: [
        "Every society has a way of producing what it needs to survive, from food and shelter to tools and energy. That productive base shapes a superstructure of laws, politics, and culture that stabilizes the system and justifies it. When the productive forces grow beyond the existing social relations, a tension builds. New classes emerge, old institutions strain, and the social order starts to crack. Historical materialism describes this dynamic as a pattern, not a prediction with a set timetable.",
        "This approach is not mechanical. It recognizes that people act, resist, and organize within material constraints. But it insists that the deepest constraints are not individual choices or moral failures. They are systemic: who owns the means of production, how labor is organized, and how surplus is distributed. Understanding those constraints helps explain why reforms sometimes stall and why upheavals sometimes erupt.",
      ],
      keyTakeaway:
        "Historical materialism explains social change through the tension between productive forces and the social relations that organize them.",
    },
    related: {
      videoTags: ["historical materialism", "materialism", "marx"],
      videoCategories: ["Theory", "History"],
      bookAuthors: ["Karl Marx", "Friedrich Engels"],
      bookTags: ["historical materialism", "materialism", "theory"],
    },
  },
  {
    id: "class-struggle",
    title: "Class Struggle",
    eyebrow: "Step 3 of 7",
    content: {
      intro:
        "Class struggle is the idea that societies are divided into groups with different relationships to production, and that these groups have conflicting interests. Under capitalism, the central divide is between those who own productive assets and those who sell their labor.",
      paragraphs: [
        "The bourgeoisie owns factories, platforms, land, and capital. The proletariat owns little besides time, skill, and effort. This creates an ongoing tension: employers seek to maximize profit, while workers seek higher pay, stability, and dignity. These interests can overlap in the short term, but they are not identical. The conflict is built into the wage relation itself.",
        "Class struggle is not only strikes and protests. It shows up in everyday negotiations, in labor laws, in automation decisions, and in political debates about taxation and welfare. It also shapes ideology: narratives about merit, productivity, and individual responsibility often serve to justify the status quo. Marxism does not claim that people are only their class. It claims that class position is a powerful force shaping how options and outcomes are distributed.",
      ],
      keyTakeaway:
        "Class struggle is the structural conflict between owners and workers over control, income, and the direction of society.",
    },
    related: {
      videoTags: ["class struggle", "workers", "labor", "capital"],
      videoCategories: ["Theory", "Labor"],
      bookAuthors: ["Karl Marx", "Friedrich Engels"],
      bookTags: ["class struggle", "labor", "capitalism"],
    },
  },
  {
    id: "surplus-value",
    title: "Surplus Value",
    eyebrow: "Step 4 of 7",
    content: {
      intro:
        "Surplus value is Marx's explanation for how profit is generated in capitalism. It argues that workers create more value during their labor than they receive back as wages, and that the difference is captured by owners.",
      paragraphs: [
        "In the labor theory of value, the value of commodities is linked to socially necessary labor time. When a worker produces goods or services worth more than the cost of their wage, that extra value becomes profit, interest, or rent. This is not a moral accusation about individual employers; it is a structural feature of the wage system. Profit depends on extracting surplus from labor, whether through longer hours, faster production, or lower wages.",
        "Surplus value helps explain why companies seek efficiency, automation, and global supply chains. These strategies reduce labor costs or increase output, expanding the surplus. It also explains why productivity gains do not always translate into higher wages. In Marxist terms, the distribution of surplus is a political and social struggle, not an automatic reward for productivity.",
      ],
      keyTakeaway:
        "Profit is generated by surplus value: the gap between what workers create and what they are paid.",
    },
    related: {
      videoTags: ["surplus value", "labor theory of value", "profit"],
      videoCategories: ["Political Economy", "Theory"],
      bookAuthors: ["Karl Marx"],
      bookTags: ["surplus value", "labor theory of value", "capital"],
    },
  },
  {
    id: "capitalist-contradictions",
    title: "Capitalism's Contradictions",
    eyebrow: "Step 5 of 7",
    content: {
      intro:
        "Marxism argues that capitalism generates powerful growth but also deep contradictions. These tensions are not accidents; they are built into how the system works.",
      paragraphs: [
        "Competition pushes firms to expand production and cut costs, yet that expansion can outpace what people can afford to buy. This creates cycles of boom and bust, overproduction, and crisis. At the same time, firms rely on workers as both producers and consumers, which means squeezing wages can undermine demand. This contradiction drives instability and periodic recessions.",
        "Another contradiction is the tendency toward concentration. Successful firms absorb competitors, and capital accumulates in fewer hands. That concentration can bring efficiency but also concentrates power, shrinking democratic control over economic life. Marxism uses these contradictions to explain why capitalism is dynamic yet fragile, innovative yet prone to inequality. The point is not to deny capitalism's achievements, but to recognize the systemic limits that create recurring crises.",
      ],
      keyTakeaway:
        "Capitalism advances productivity but repeatedly collides with crises, inequality, and concentrated power.",
    },
    related: {
      videoTags: ["capitalism", "crisis", "profit", "inequality"],
      videoCategories: ["Political Economy", "Economics"],
      bookAuthors: ["Karl Marx", "Friedrich Engels"],
      bookTags: ["capitalism", "crisis", "inequality"],
    },
  },
  {
    id: "socialism-communism",
    title: "Socialism vs Communism",
    eyebrow: "Step 6 of 7",
    content: {
      intro:
        "In Marxist theory, socialism and communism are not synonyms. They describe different stages of social transformation after capitalism.",
      paragraphs: [
        "Socialism refers to a transitional period in which the working class gains political power and begins to socialize key industries. The aim is to replace private ownership with democratic control, reduce exploitation, and build the conditions for a more equal society. Because class structures and market habits persist, socialism is often described as a phase of struggle and institutional experimentation.",
        "Communism describes a later stage where class divisions dissolve and production is organized for human need rather than profit. In this vision, the state as a coercive force withers away because its role in enforcing class rule becomes unnecessary. Marxist debates focus on how to reach this stage and what institutions can prevent new forms of domination. Regardless of the path, the core idea is that economic democracy and shared abundance are possible.",
      ],
      keyTakeaway:
        "Socialism is the transition toward collective ownership; communism is the horizon of a classless society.",
    },
    related: {
      videoTags: ["socialism", "communism", "workers control", "transition"],
      videoCategories: ["Theory", "History"],
      bookAuthors: ["Karl Marx", "Friedrich Engels"],
      bookTags: ["socialism", "communism", "transition"],
    },
  },
  {
    id: "marxism-today",
    title: "Marxism Today",
    eyebrow: "Step 7 of 7",
    content: {
      intro:
        "Marxism remains relevant because the issues it diagnoses are still with us: inequality, precarious work, financial crises, and ecological strain. It offers tools to connect everyday problems to deeper structures.",
      paragraphs: [
        "In contemporary capitalism, wealth has concentrated dramatically, while wages lag behind productivity. Gig work, automation, and global supply chains have restructured labor markets, often increasing insecurity. Marxist analysis helps explain why these trends are not just policy choices but consequences of how profit-driven systems operate. It also provides a lens for understanding movements that challenge inequality and demand democratic control of resources.",
        "The climate crisis has added a new dimension. Extractive industries and endless growth collide with ecological limits. Marxist thinkers have extended historical materialism to include humanity's relationship with nature, arguing that capitalism treats the environment as a free input and a dumping ground. The result is a metabolic rift between society and the ecosystems it depends on. Marxism today is not a fixed doctrine; it is a living method used to analyze and act within a rapidly changing world.",
      ],
      keyTakeaway:
        "Marxism offers a living framework for understanding inequality, labor precarity, and ecological crisis today.",
    },
    related: {
      videoTags: ["marxism today", "inequality", "climate", "capitalism"],
      videoCategories: ["Contemporary", "Political Economy"],
      bookAuthors: ["Karl Marx", "Friedrich Engels"],
      bookTags: ["marxism", "inequality", "climate"],
    },
  },
];

export const guideSectionsById = new Map(guideSections.map((section) => [section.id, section]));
