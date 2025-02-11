document.addEventListener("DOMContentLoaded", function () {
  const profileGrid = document.getElementById("profileGrid");
  const explorerButton = document.getElementById("explorerButton");

  async function fetchYouTubeVideos() {
    const apiKey = "AIzaSyC78lbxVVN3V1h2JdaZW0YFYXc-ZuOr7PA";
    const channelId = "UCNCVLTj9ABPItp57el2ukKA";
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items.map(item => ({
        type: "video",
        url: `https://www.youtube.com/embed/${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.medium.url
      }));
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      return [];
    }
  }

  async function fetchGoogleDriveImages() {
    const folderId = "13hpkSwnYS7uLHH8XzQZLP1KaywhgfJu-";
    const apiKey = "AIzaSyCY65oXHdmqbD0nvdj_WaaMLMubTg6Xtp4";
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType)`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.files.filter(file => file.mimeType.startsWith("image/")).map(file => ({
        type: "image",
        url: `https://drive.google.com/uc?id=${file.id}`
      }));
    } catch (error) {
      console.error("Error fetching Google Drive images:", error);
      return [];
    }
  }

  async function loadContent() {
    profileGrid.innerHTML = "";
    const [videos, images] = await Promise.all([fetchYouTubeVideos(), fetchGoogleDriveImages()]);
    const content = [...videos, ...images].sort(() => Math.random() - 0.5);
    content.forEach(item => {
      const element = document.createElement("div");
      element.classList.add("grid-item");
      if (item.type === "video") {
        element.innerHTML = `<img src="${item.thumbnail}" data-url="${item.url}" data-type="video">`;
      } else {
        element.innerHTML = `<img src="${item.url}" data-url="${item.url}" data-type="image">`;
      }
      element.addEventListener("click", () => openViewer(content, item.url));
      profileGrid.appendChild(element);
    });
  }

  function openViewer(content, startUrl) {
    const viewer = document.createElement("div");
    viewer.classList.add("viewer");
    viewer.innerHTML = `<div class="viewer-content"></div>`;
    const viewerContent = viewer.querySelector(".viewer-content");
    content.forEach(item => {
      const slide = document.createElement("div");
      slide.classList.add("viewer-slide");
      if (item.type === "video") {
        slide.innerHTML = `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`;
      } else {
        slide.innerHTML = `<img src="${item.url}" >`;
      }
      viewerContent.appendChild(slide);
    });
    viewer.addEventListener("click", () => viewer.remove());
    document.body.appendChild(viewer);
  }

  explorerButton.addEventListener("click", loadContent);
  loadContent();
});