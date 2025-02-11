

        
     const googleDriveFolderId = "1EB3QENe0BKgXrysT1uX1OucNv1PETrVC"; // Replace with your Google Drive folder ID
    const googleDriveApiKey = "AIzaSyDidqXX_td5Ccx2z4whYoODao8ZVXoag7s"; // Replace with your Google Drive API Key
     const youtubeApiKey = "AIzaSyBBFacR6TgrAMO4k7-6R5aYCTRICWqRlaA"; // Replace with your YouTube API Key
    const youtubeChannelId = "UCNCVLTj9ABPItp57el2ukKA"; // Replace with actual YouTube Channel ID



let nextPageToken = "";
let imageNextPageToken = "";
let loading = false;
let fullscreenContent = [];
let currentIndex = 0;
// Fetch images from Google Drive


// async function fetchGoogleDriveImages() {
//     // const url = `https://www.googleapis.com/drive/v3/files?q='${googleDriveFolderId}'+in+parents+and+mimeType+contains+'image'&key=${googleDriveApiKey}&fields=files(id,name,mimeType)&pageToken=${imageNextPageToken}`;
//     // const url = `https://www.googleapis.com/drive/v3/files?q='${googleDriveFolderId}' in parents&key=${googleDriveApiKey}&fields=files(id,name,mimeType)&pageToken=${imageNextPageToken}`;
//     const url = `https://www.googleapis.com/drive/v3/files?q='${googleDriveFolderId}'+in+parents+and+mimeType+contains+'image'&key=${googleDriveApiKey}&fields=files(id,name,mimeType)&pageToken=${imageNextPageToken}`;

//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//          console.log("Google Drive API Response:", data); // Log the response
        
//         imageNextPageToken = data.nextPageToken || "";

//         // Check if 'files' exists and is an array
//         if (data.files && Array.isArray(data.files)) {
//             return data.files.map(file => ({
//                 type: "image",
//                 src: `https://drive.google.com/uc?id=${file.id}`,
                
//             }));
//         } else {
//             console.error("No images found in the Google Drive response.");
//             return [];
//         }
//     } catch (error) {
//         console.error("Error fetching Google Drive images:", error);
//         return [];
//     }
// }

async function fetchGoogleDriveImages() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${googleDriveFolderId}'+in+parents+and+mimeType+contains+'image'&key=${googleDriveApiKey}&fields=files(id,name,mimeType)&pageToken=${imageNextPageToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Google Drive API Response:", data); // Log the full response for debugging

        imageNextPageToken = data.nextPageToken || "";

        // Check if the 'files' array is present
        if (data.files && Array.isArray(data.files)) {
            data.files.forEach(file => {
                console.log("File MIME Type:", file.mimeType); // Log mime type to check if it's an image
            });

            return data.files.map(file => {
                const imgUrl = `https://drive.google.com/uc?id=${file.id}`;
                console.log("Generated Image URL:", imgUrl); // Log the generated image URL

                return {
                    type: "image",
                    src: imgUrl,
                };
            });
        } else {
            console.error("No images found in the Google Drive response.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching Google Drive images:", error);
        return [];
    }
}


// Fetch videos from YouTube
async function fetchYouTubeVideos() {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&channelId=${youtubeChannelId}&part=snippet,id&order=date&type=video&maxResults=10&pageToken=${nextPageToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("YouTube API Response:", data); // Log the response

        // Ensure 'items' exists before using 'map'
        if (data.items && Array.isArray(data.items)) {
            nextPageToken = data.nextPageToken || "";

            return data.items.map(item => ({
                type: "video",
                videoId: item.id.videoId,
                thumbnail: item.snippet.thumbnails.medium.url,
                src: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1`
            }));
        } else {
            console.error("No videos found in the YouTube response.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
}




// Load images & videos into the grid
async function loadContent() {
    if (loading) return;
    loading = true;

    const gridContainer = document.getElementById("profileGrid");

    const [images, videos] = await Promise.all([
        fetchGoogleDriveImages(),
        fetchYouTubeVideos()
    ]);

    const combinedContent = [...images, ...videos];

    fullscreenContent = [...fullscreenContent, ...combinedContent];

    combinedContent.forEach((item, index) => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");

        if (item.type === "image") {
            gridItem.innerHTML = `<img src="${item.src}" alt="Image" onclick="openFullscreen(${fullscreenContent.length - combinedContent.length + index})">`;
        } else if (item.type === "video") {
            gridItem.innerHTML = `
                <img src="${item.thumbnail}" alt="Video" onclick="openFullscreen(${fullscreenContent.length - combinedContent.length + index})">
            `;
        }

        gridContainer.appendChild(gridItem);
    });

    loading = false;
}

// Open fullscreen with infinite scroll
function openFullscreen(index) {
    currentIndex = index;
    updateFullscreenContent();
    document.getElementById("fullscreenModal").style.display = "flex";
}

// Close fullscreen when ESC key is pressed
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeFullscreen();
    }
});

// Update fullscreen content dynamically
function updateFullscreenContent() {
    const modalContent = document.getElementById("modalContent");

    const item = fullscreenContent[currentIndex];

    if (item.type === "image") {
        modalContent.innerHTML = `<img src="${item.src}" class="fullscreen-content">`;
    } else if (item.type === "video") {
        modalContent.innerHTML = `<iframe src="${item.src}" allowfullscreen class="fullscreen-content"></iframe>`;
    }
}

// Handle infinite scrolling inside fullscreen mode
document.getElementById("fullscreenModal").addEventListener("wheel", (event) => {
    if (event.deltaY > 0) {
        currentIndex = (currentIndex + 1) % fullscreenContent.length;
    } else {
        currentIndex = (currentIndex - 1 + fullscreenContent.length) % fullscreenContent.length;
    }
    updateFullscreenContent();
});

// Close the full-screen viewer
function closeFullscreen() {
    document.getElementById("fullscreenModal").style.display = "none";
}

// Load new content when user clicks "Explore"
document.getElementById("explorerButton").addEventListener("click", () => {
    document.getElementById("profileGrid").innerHTML = ""; // Clear current content
    fullscreenContent = [];
    loadContent();
});

// Infinite Scroll in grid view
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading) {
        loadContent();
    }
});

// Load initial content
document.addEventListener("DOMContentLoaded", loadContent);
