const firebaseConfig = {
    apiKey: "AIzaSyD73Kg3wKe1ImJ5QWJCON20jhz72QAkMVo",
    authDomain: "our-memory-lane-fd8c2.firebaseapp.com",
    projectId: "our-memory-lane-fd8c2",
    storageBucket: "our-memory-lane-fd8c2.appspot.com",
    messagingSenderId: "376444653241",
    appId: "1:376444653241:web:5e02f4f4dc79132bac1568",
    measurementId: "G-ET8RFX62RP"
};

const IMGBB_API_KEY = "561fce2d73e0183eef3f7d771941141c"; 

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


const photoInput = document.getElementById('photo-input');
const captionInput = document.getElementById('caption-input');
const uploadBtn = document.getElementById('upload-btn');
const albumGrid = document.getElementById('album-grid');


uploadBtn.addEventListener('click', () => {
    const file = photoInput.files[0];
    const caption = captionInput.value.trim();

    if (!file) return alert("Please select a beautiful photo first!");

    uploadBtn.innerText = "Uploading Photo...";
    uploadBtn.disabled = true;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function () {
        const base64String = reader.result.split(',')[1]; 

        const formData = new FormData();
        formData.append('image', base64String); 

        fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error("ImgBB host response felt shaky.");
            return response.json();
        })
        .then(result => {
            if (result.success && result.status === 200) {
                const uploadedUrl = result.data.url; 

                return db.collection('photos').add({
                    url: uploadedUrl,
                    caption: caption || "A beautiful memory",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                throw new Error(result.error.message || 'ImgBB rejected the upload.');
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
            console.error("Error Details:", error);
            alert("Upload failed! Check the developer console for details.");
            uploadBtn.innerText = "Upload to Album";
            uploadBtn.disabled = false;
        });
    };
});


db.collection('photos').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    albumGrid.innerHTML = ''; 
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        const docId = doc.id; 
        
        const randomRotate = (Math.random() * 6 - 3).toFixed(1); 

        const card = document.createElement('div');
        card.className = 'polaroid';
        card.style.setProperty('--rotation', `${randomRotate}deg`);

        card.innerHTML = `
            <div class="delete-btn" data-id="${docId}">Delete</div>
            <img src="${data.url}" alt="Memory Link">
            <div class="caption">${data.caption}</div>
        `;
        
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            if (confirm("Are you sure you want to delete this memory?")) {
                db.collection('photos').doc(docId).delete()
                .then(() => {
                    alert("Memory removed from the lane.");
                })
                .catch((error) => {
                    console.error("Error removing document: ", error);
                    alert("Oops! Couldn't delete it right now.");
                });
            }
        });
        
        albumGrid.appendChild(card);
    });
}, (error) => {
    console.error("Database tracking broken:", error);
});
