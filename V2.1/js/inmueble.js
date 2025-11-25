export async function obtenerInmuebles(pagina = 1) {

    const token = "6kwdZqPVaOs6IIVwC1VLpgrf72JCKLXB9dvuVSxK-861";

    // ESTE ES EL ENDPOINT QUE DEBES USAR
    const url = `http://simi-api.com/ApiSimiweb/response/v2.1.1/filtroInmueble/limite/1/total/10/departamento/0/ciudad/0/zona/0/barrio/0/tipoInm/0/tipOper/0/areamin/0/areamax/0/valmin/0/valmax/0/campo/0/order/0/banios/0/alcobas/0/garajes/0/sede/0/usuario/0`;

    try {
        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Basic " + btoa(":" + token),
            }
        });

        const data = await respuesta.json();

        if (!data.Inmuebles) return [];
        return data.Inmuebles;

    } catch (error) {
        console.error("Error cargando inmuebles:", error);
        return [];
    }
}
