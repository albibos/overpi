async function fetchHeroData(heroId) {
    try {
      const response = await fetch(`https://overpi.albinus.gay/hero?n=${heroId}`);
      const heroData = await response.json();

      const heroDetails = document.getElementById('hero-details');
      heroDetails.innerHTML = `
        <h1>${heroData.name}</h1>
        <img src="${heroData.portrait}" alt="${heroData.name} Portrait">
        <p>${heroData.description}</p>
        <h2>Role: ${heroData.role}</h2>
        <p>Location: ${heroData.location}</p>
        <h2>Hitpoints</h2>
        <p>Health: ${heroData.hitpoints.health}</p>
        <p>Armor: ${heroData.hitpoints.armor}</p>
        <p>Shields: ${heroData.hitpoints.shields}</p>
        <h2>Abilities</h2>
        ${heroData.abilities.map(ability => `
          <div>
            <h3>${ability.name}</h3>
            <img src="${ability.icon}" alt="${ability.name} Icon">
            <p>${ability.description}</p>
            <video controls>
              <source src="${ability.video.link.mp4}" type="video/mp4">
              <source src="${ability.video.link.webm}" type="video/webm">
              Your browser does not support the video tag.
            </video>
          </div>
        `).join('')}
        <h2>Story</h2>
        <p>${heroData.story.summary}</p>
        ${heroData.story.chapters.map(chapter => `
          <div>
            <h3>${chapter.title}</h3>
            <p>${chapter.content}</p>
            <img src="${chapter.picture}" alt="${chapter.title} Picture">
          </div>
        `).join('')}
      `;
    } catch (error) {
      console.error('Error fetching hero data:', error);
    }
  }

  const queryParams = new URLSearchParams(window.location.search);
  const heroId = queryParams.get('n');

  if (heroId) {
    fetchHeroData(heroId);
  } else {
    console.error('Hero id not provided.');
  }