// Function to generate a random numeric string of a given length
 export function generateNumericString(length: any) {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        result += digits.charAt(randomIndex);
    }
    return result;
}

