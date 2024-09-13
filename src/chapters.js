export const chapters = [
    {
      title: '第1章',
      sections: [
        {
          title: 'デジタル時代のマーケティングの特性',
          subSections: Array.from({ length: 3 }, (_, subIndex) => {
            const sectionData = require(`./data/chapter1/chapter1_${subIndex + 1}.js`);
            return {
              title: sectionData.title,
              chapterId: `1_${subIndex + 1}`,
            };
          }),
        },
        {
          title: '現状分析',
          subSections: Array.from({ length: 4 }, (_, subIndex) => {
            const sectionData = require(`./data/chapter1/chapter1_${subIndex + 4}.js`);
            return {
              title: sectionData.title,
              chapterId: `1_${subIndex + 4}`,
            };
          }),
        },
        {
          title: 'リピート促進',
          subSections: Array.from({ length: 6 }, (_, subIndex) => {
            const sectionData = require(`./data/chapter1/chapter1_${subIndex + 8}.js`);
            return {
              title: sectionData.title,
              chapterId: `1_${subIndex + 8}`,
            };
          }),
        },
        {
          title: '予算配分（LTV・CPA・CPO）',
          subSections: Array.from({ length: 7 }, (_, subIndex) => {
            const sectionData = require(`./data/chapter1/chapter1_${subIndex + 14}.js`);
            return {
              title: sectionData.title,
              chapterId: `1_${subIndex + 14}`,
            };
          }),
        },
      ],
    },
    {
      title: '第2章',
      sections: Array.from({ length: 2 }, (_, sectionIndex) => {
        const sectionData = require(`./data/chapter2/chapter2_${sectionIndex + 1}.js`);
        return {
          title: sectionData.title,
          chapterId: `2_${sectionIndex + 1}`,
        };
      }),
    },
  ];
  