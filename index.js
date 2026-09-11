const apiURL = "https://pokeapi.co/api/v2";
const input = document.getElementById('form-input');
const form = document.getElementById('search-form');
const chainWrapper = document.getElementById('chainWrapper');

async function processChain(chain, evolutionArray = []) {
    const evolutionResponse = await fetch(`${apiURL}/pokemon/${chain.species.name}`)
    const evolutionData = await evolutionResponse.json()
    const evolutionImg = evolutionData.sprites.other["official-artwork"].front_default ?? pokemonData.sprites.front_default

    evolutionArray.push([chain.species.name,evolutionImg]);
    if (chain.evolves_to.length === 0) {
        return evolutionArray;
    }

    for (const evolution of chain.evolves_to) {
        await processChain(evolution, evolutionArray);
    }

    return evolutionArray;
}

async function getPokemon(name) {
    try {
        const pokemonResponse = await fetch(`${apiURL}/pokemon/${name.toLowerCase()}`);

        if (!pokemonResponse.ok) {
            throw new Error(`Could not fetch Pokémon ${pokemonResponse.status}: ${pokemonResponse.statusText}`);
        }

        const pokemonData = await pokemonResponse.json();

        const pokemonTypes = []
        for (const type of pokemonData.types) {
            pokemonTypes.push(type.type.name);
        }

        const pokemonAbilities = []
        for (const ability of pokemonData.abilities) {
            pokemonAbilities.push(ability.ability.name);
        }

        const pokemonStats = []
        for (const stat of pokemonData.stats) {
            pokemonStats.push([stat.stat.name, stat.base_stat]);
        }

        const image = pokemonData.sprites.other["official-artwork"].front_default ?? pokemonData.sprites.front_default;

        const speciesResponse = await fetch(pokemonData.species.url);

        if (!speciesResponse.ok) {
            throw new Error(`Could not fetch species ${speciesResponse.status}`)
        }

        const pokemonSpecies = await speciesResponse.json();
        const descriptionEntry = pokemonSpecies.flavor_text_entries.find((entry => entry.language.name === "en"))
        const pokemonDescription = descriptionEntry?.flavor_text.replace(/[\n\f]/g, " ") ?? "Description unavailable";

        const evolutionResponse = await fetch(pokemonSpecies.evolution_chain.url)

        if (!evolutionResponse.ok) {
            throw new Error(`Could not fetch evolution ${evolutionResponse.status}`)
        }

        const pokemonEvolutionChain = await evolutionResponse.json();

        const pokemonEvolution = await processChain(pokemonEvolutionChain.chain)

        const pokemonObject = {
            name: pokemonData.name,
            number: pokemonData.id,
            types: pokemonTypes,
            height: pokemonData.height / 10,
            weight: pokemonData.weight / 10,
            imageUrl: image,
            abilities: pokemonAbilities,
            stats: pokemonStats,
            description: pokemonDescription,
            evolutions: pokemonEvolution
        }

        console.log(pokemonObject);

        return pokemonObject;
    } catch (error) {
        console.error(`Error getting Pokémon: ${error.message}`);
    }
}

function getRandomNumber(max){
    console.log(Math.floor(Math.random()*max))
    return Math.floor(Math.random()*max)
}

function renderTypes(typesElement, typesArray){
    typesElement.innerHTML = typesArray.map(type => {
        return `<span>${type}</span>`
    }).join("");
}

function renderAbilities(abilitiesElement, abilitiesArray){
    abilitiesElement.innerHTML = abilitiesArray.map(ability => {
        return `<span>${ability}</span>`
    }).join("");
}

function renderStats(statsElement, statsArray){
    statsElement.innerHTML = statsArray.map(([name,value]) => {
        const percentage = (value / 255) * 100;
        const barWidth = Math.max(12, percentage);
        return `<div class="singular-stat">
                    <div class="stat-name">
                        <span>${name}</span>
                        <span>${value}</span>
                    </div>
                    <div class="stat-bar" style="--bar-width: ${barWidth}%">${value}%</div>
                </div>`
    }).join("")
}

function renderEvolutions(evolutionsElement, evolutionsArray){
    evolutionsElement.innerHTML = evolutionsArray.map(([name,image]) => {
        return `<button class="evolution-card" data-evolution-name="${name}">
                    <div class="evolution-img" style="background-image: url('${image}')"></div>
                    <span>${name}</span>
                </button>`
    }).join("")
}

function showInformation(pokemon){
    const name = document.getElementById('pokemon-name')
    name.textContent = pokemon.name

    const number = document.getElementById('pokemon-number')
    number.textContent = pokemon.number

    const types = document.getElementById('pokemonTypes')
    renderTypes(types, pokemon.types)

    const height = document.getElementById('pokemon-height')
    height.textContent = pokemon.height

    const weight = document.getElementById('pokemon-weight')
    weight.textContent = pokemon.weight

    const img = document.getElementById('pokemon-img')
    img.src = pokemon.imageUrl

    const abilities = document.getElementById('pokemon-abilities')
    renderAbilities(abilities,pokemon.abilities)

    const stats = document.getElementById('pokemonStats')
    renderStats(stats,pokemon.stats)

    const description = document.getElementById('pokemon-description')
    description.textContent = pokemon.description

    const evolutions = document.getElementById('chainWrapper')
    renderEvolutions(evolutions,pokemon.evolutions)

}

document.addEventListener('DOMContentLoaded', async() => {
    const randomPokemon = String(getRandomNumber(100))
    const pokemonInformation = await getPokemon(randomPokemon)
    showInformation(pokemonInformation)
})

form.addEventListener('submit', async(event) => {
    event.preventDefault()
    const pokemonName = input.value;
    const pokemonInformation =  await getPokemon(pokemonName);
    showInformation(pokemonInformation);
});

chainWrapper.addEventListener('click', async (event) => {
    const card = event.target.closest(".evolution-card")
    if (!card) {
        return
    }

    const pokemonName = card.getAttribute('data-evolution-name')

    const pokemonInformation =  await getPokemon(pokemonName);
    showInformation(pokemonInformation);
})
