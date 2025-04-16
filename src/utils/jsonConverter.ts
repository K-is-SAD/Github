export const convertToJSON= async(inputString : string) => {
    let content = inputString;
    
    // Remove markdown code block markers if present
    if (inputString.startsWith('```')) {
        // Extract the content between the markers
        const firstLineEnd = inputString.indexOf('\n');
        const lastBacktick = inputString.lastIndexOf('```');
        content = inputString.substring(firstLineEnd + 1, lastBacktick).trim();
    }

    // content = content.replace('```json\n', '');
    // content = content.replace('```', '');
    // content = content.replaceAll('\n', ''); 
    
    try {
        // Parse the JSON string
        const jsonObj = await JSON.parse(content);
        return jsonObj;
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return null;
    }
}