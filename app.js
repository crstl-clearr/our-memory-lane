const firebaseConfig = {
    apiKey: "AIzaSyD73Kg3wKe1ImJ5QWJCON20jhz72QAkMVo",
    authDomain: "our-memory-lane-fd8c2.firebaseapp.com",
    projectId: "our-memory-lane-fd8c2",
    storageBucket: "our-memory-lane-fd8c2.appspot.com",
    messagingSenderId: "376444653241",
    appId: "1:376444653241:web:5e02f4f4dc79132bac1568",
    measurementId: "G-ET8RFX62RP"
};

const FREEIMAGE_HOST_API_KEY = "6d207e02198a847aa98d0a2a901485a5"; 

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


const photoInput = document.getElementById('photo-input');
const captionInput = document.getElementById('caption-input');
const uploadBtn = document.getElementById('upload-btn');
const albumGrid = document.getElementById('album-grid');


uploadBtn.addEventListener('click', () => {
    const file = photoInput.files[0];
    const caption = captionInput.value.trim();

    if (!file) return alert("Please select a photo first!");

    uploadBtn.innerText = "Uploading Photo...";
    uploadBtn.disabled = true;

    const formData = new FormData();
    formData.append('key', FREEIMAGE_HOST_API_KEY);
    formData.append('action', 'upload');
    formData.append('source', file);

    fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error("Network response wasn't stable.");
        return response.json();
    })
    .then(result => {
        if (result.status_code === 200) {
            const uploadedUrl = result.image.url;

            return db.collection('photos').add({
                url: uploadedUrl,
                caption: caption || "A beautiful memory",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            throw new Error(result.error.message || 'Image host rejected the image.');
        }
    })
    .then(() => {
        photoInput.value = '';
        captionInput.value = '';
        uploadBtn.innerText = "Upload to Album";
        uploadBtn.disabled = false;
        alert("Memory added!");
    })
    .catch(error => {
        console.error("Upload Error Details:", error);
        alert("Upload failed! Check the developer console for full details.");
        uploadBtn.innerText = "Upload to Album";
        uploadBtn.disabled = false;
    });
});

db.collection('photos').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    albumGrid.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        
        const randomRotate = (Math.random() * 6 - 3).toFixed(1); 

        const card = document.createElement('div');
        card.className = 'polaroid';
        card.style.setProperty('--rotation', `${randomRotate}deg`);

        card.innerHTML = `
            <img src="${data.url}" alt="Memory Link">
            <div class="caption">${data.caption}</div>
        `;
        
        albumGrid.appendChild(card);
    });
}, (error) => {
    console.error("Firestore database connection failed:", error);
});