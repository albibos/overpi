document.addEventListener("DOMContentLoaded", () => {
  const queryParams = new URLSearchParams(window.location.search);
  const query = queryParams.get("q");

    fetch(`https://overpi.albinus.gay/player/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            const resultsGrid = document.getElementById("resultsGrid");
            const queryResultsCount = document.getElementById("queryResultsCount");

            queryResultsCount.textContent = `Found ${data.total} people with the name ${query}`;

            data.results.forEach(player => {
                const playerElement = document.createElement("div");
                playerElement.classList.add("player");
                playerElement.innerHTML = `
                    <a href="${player.url}" target="_blank">
                        <h3>${player.name}</h3>
                    </a>
                    <p>${player.privacy}</p>
                `;
                resultsGrid.appendChild(playerElement);
            });
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
});
