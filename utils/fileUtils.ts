
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URL prefix (e.g., "data:image/png;base64,")
            const base64String = result.split(',')[1];
            if (!base64String) {
                reject(new Error("Failed to convert file to base64 string."));
                return;
            }
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};
