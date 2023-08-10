const heroesGrid = document.getElementById("heroesGrid");

async function fetchHeroes() {
  try {
    const response = await fetch("https://overpi.albinus.gay/heroes");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching heroes:", error);
  }
}

function createHeroElement(hero) {
  const heroElement = document.createElement("div");
  heroElement.classList.add("hero-card");

  const img = document.createElement("img");
  img.src = hero.portrait;
  img.alt = hero.name;
  img.classList.add("hero-image");
  heroElement.appendChild(img);

  const name = document.createElement("div");
  name.textContent = hero.name;
  name.classList.add("hero-name");
  heroElement.appendChild(name);

  const role = document.createElement("div");
  role.textContent = hero.role;
  role.classList.add("hero-role");
  heroElement.appendChild(role);

  heroElement.setAttribute("data-hero-key", hero.key);

  heroElement.addEventListener("click", () => {
    const heroKey = hero.key;
    window.location.href = `/hero?name=${heroKey}`;
});

  return heroElement;
}

async function populateHeroesGrid() {
  const heroes = await fetchHeroes();
  heroesGrid.innerHTML = "";

  heroes.forEach(hero => {
    const heroElement = createHeroElement(hero);
    heroesGrid.appendChild(heroElement);
  });
}

populateHeroesGrid();