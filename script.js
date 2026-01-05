// ================================
// CLOUDINARY CONFIG
// ================================
const CLOUD_NAME = "dyo9qpuab";
const UPLOAD_PRESET = "sujeeth";

// ================================
// ELEMENT REFERENCES
// ================================
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.querySelector(".upload-btn");
const gallery = document.getElementById("gallery");
const preview = document.getElementById("preview");
const progressBar = document.getElementById("progress");
const dropZone = document.getElementById("dropZone");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("mediaModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

let selectedFile = null;

// ================================
// FILE SELECT
// ================================
fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  showPreview(selectedFile);
});

// ================================
// DRAG & DROP
// ================================
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#00eaff";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "rgba(255,255,255,0.6)";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "rgba(255,255,255,0.6)";
  selectedFile = e.dataTransfer.files[0];
  showPreview(selectedFile);
});

// ================================
// PREVIEW
// ================================
function showPreview(file) {
  preview.innerHTML = "";
  if (!file) return;

  const url = URL.createObjectURL(file);
  if (file.type.includes("video")) {
    preview.innerHTML = `<video src="${url}" controls></video>`;
  } else {
    preview.innerHTML = `<img src="${url}">`;
  }
}

// ================================
// UPLOAD TO CLOUDINARY
// ================================
uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please select a file");
    return;
  }

  uploadBtn.innerText = "Uploading...";
  uploadBtn.disabled = true;
  progressBar.style.width = "0%";

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  const xhr = new XMLHttpRequest();
  xhr.open(
    "POST",
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`
  );

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percent + "%";
    }
  };

  xhr.onload = () => {
    const data = JSON.parse(xhr.responseText);
    addToGallery(data.secure_url, data.resource_type);

    // Reset
    selectedFile = null;
    fileInput.value = "";
    preview.innerHTML = "";
    progressBar.style.width = "0%";
    uploadBtn.innerText = "Upload Media";
    uploadBtn.disabled = false;
  };

  xhr.onerror = () => {
    alert("Upload failed");
    uploadBtn.innerText = "Upload Media";
    uploadBtn.disabled = false;
  };

  xhr.send(formData);
});

// ================================
// ADD MEDIA TO GALLERY
// ================================
function addToGallery(url, type) {
  document.querySelector(".empty-text")?.remove();

  const card = document.createElement("div");
  card.className = "media-card";
  card.dataset.type = type;

  if (type === "video") {
    card.innerHTML = `<video src="${url}" muted></video>`;
  } else {
    card.innerHTML = `<img src="${url}">`;
  }

  card.addEventListener("click", () => openModal(url, type));
  gallery.prepend(card);
}

// ================================
// MODAL PREVIEW
// ================================
function openModal(url, type) {
  modal.style.display = "flex";
  modalContent.innerHTML =
    type === "video"
      ? `<video src="${url}" controls autoplay></video>`
      : `<img src="${url}">`;
}

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  modalContent.innerHTML = "";
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    modalContent.innerHTML = "";
  }
});

// ================================
// SEARCH FILTER
// ================================
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  document.querySelectorAll(".media-card").forEach(card => {
    const type = card.dataset.type;
    card.style.display =
      type.includes(value) || value === "" ? "block" : "none";
  });
});
