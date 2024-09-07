export const getLocationName = async ({ index, lat, lon }) => {
    try {
        const nameJson = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const nameData = await nameJson.json();
        const name = [
            nameData?.address?.city,
            nameData?.address?.state,
            nameData?.address?.country
        ].filter(v => v).join(', ');
        console.log('return value is:', name || nameData?.display_name);
        return name || nameData?.display_name
    }
    catch (error) {
        console.log(error);
    }
}