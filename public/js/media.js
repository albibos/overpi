    async function fetchImages() {
      try {
        const response = await fetch('https://overpi.albinus.gay/media/screenshots');
        const data = await response.json();
        const gallery = document.getElementById('gallery');

        for (const game in data) {
          const screenshots = data[game];
          screenshots.forEach((url) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'image-container';

            const img = document.createElement('img');
            img.src = url;
            img.alt = game;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'image-name';
            nameDiv.textContent = game;

            imageDiv.appendChild(img);
            imageDiv.appendChild(nameDiv);
            gallery.appendChild(imageDiv);
          });
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }

    fetchImages();