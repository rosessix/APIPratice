const API_URL = 'https://corsproxy.io/?https://www.tjekbil.dk/api/v3/dmr/regnrquery';
const MOT_URL = 'https://corsproxy.io/?https://www.tjekbil.dk/api/v3/tstyr/reports?vin='
// Dette kører igennem en corsproxy, da jeg fik en CORS fejl.

const searchPlate = async (plate) => {
    if (plate == undefined) {
        plate = $("#numberplate").val();
    }

    let request = await fetch(`${API_URL}/${plate}?amount=1`);
    let json;
    try {
        json = await request.json();
    } catch(err) {
        return $('#vehicle').html(`<h3>Der kunne ikke findes noget data på dette køretøj.<h3/>`);
    }


    let data = json[0];
    console.log(data);

    $('#vehicle').html(`
        <p>Model: ${data.maerkeTypeNavn} ${data.modelTypeNavn} ${data.variantTypeNavn !== undefined ? data.variantTypeNavn : ''}</p>
        <p>Nummerplade: ${data.regNr}</p>
        <p>Stel NR: ${data.stelNr}</p>
        <p>Drivkraft: ${data.drivkraftTypeNavn}</p>
        ${data.status === 'Afmeldt' ? '<p class="text-red">Status: Afmeldt</p>' : ''}

        <div id="vehicle-equipment">Mærkværdigt udstyr: </div>
    `)

    let dEquip = data.koeretoejUdstyrSamling
    if (dEquip.length !== 0) {
        for (const equipment of dEquip) {
            $('#vehicle-equipment').append(`<p>${equipment}</p>`)
        }
    }

    populateMot(data.stelNr);
    populateExpenses(data)
}

const populateMot = async (identifier) => {
    $('#mot').html('Indlæser...')
    let request = await fetch(`${MOT_URL}${identifier}`)
    let response = await request.json()
    let data = response.rapporter;
    $('#mot').html('')
    for (const value of data) {
        let motColor = getMotColor(value.synsresultat)
        console.log('changing data?')
        $('#mot').append(`
        <div class="mot-card ${motColor}">
            <h3>${value.synsresultat}</h3>
            <p>${value.firma}</p>
            ${value.fejl.length !== 0 ? `<p>Fejl: ${value.fejl[0].description}</p>` : ''}
            <p>Dato: ${value.synsdato}</p>
            <p>Km stand: ${value.kmstand}</p>
        </div>
        `)
    }
}

const populateExpenses = async (vehicle) => {
    $('#expenses').html(`
        <p>KM/L: ${vehicle.motorKmPerLiter || "Ukendt"}</p>

    `)
}

const getMotColor = (result) => {
    switch(result) {
        case 'Godkendt':
            return 'green'
        case 'Betinget godkendt':
        case 'Middel':
        case 'Kan godkendes efter omsyn hos (om)synsvirksomhed':
            return 'yellow'
        case 'idk': 
        // Jeg kunne ikke finde en bil der decideret havde dumpet syn, så her skal der stå dumpet syn eller noget lignene
            return 'red'
    }

    return ''
}
// '
// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(() => {
//         searchPlate('DM57724')
//     }, 500);
// })'