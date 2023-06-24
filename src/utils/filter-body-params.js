export function filterBodyParams(req) {
    const bodyAsArray = Object.entries(req.body);
    const bodyFiltered = bodyAsArray.filter(([key, value]) => {
        const keys = {
            "title": value,
            "description": value
        }

        return keys[key];
    });

    const bodyAsObject = Object.fromEntries(bodyFiltered);

    return bodyAsObject;
}