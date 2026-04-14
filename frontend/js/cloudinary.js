const CLOUD_NAME = 'dfgtpljtq';
const UPLOAD_PRESET = 'nishant-events';

/**
 * Uploads a File object to Cloudinary and returns the secure URL.
 *
 * @param {File} file         - The image file to upload.
 * @param {Function} onProgress - Optional callback(percent) for progress updates.
 * @returns {Promise<string>} - Resolves with the Cloudinary secure_url.
 */
export async function uploadToCloudinary(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
        }

        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url);
            } else {
                let msg = 'Cloudinary upload failed.';
                try {
                    const err = JSON.parse(xhr.responseText);
                    msg = err.error?.message || msg;
                } catch (_) { }
                reject(new Error(msg));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(formData);
    });
}
