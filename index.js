const apiURL = "https://pokeapi.co/api/v2";

function processChain(chain, evolutionArray = []) {
    evolutionArray.push(chain.species.name);

    if (chain.evolves_to.length === 0) {
        return evolutionArray;
    }

    for (const evolution of chain.evolves_to) {
        processChain(evolution, evolutionArray);
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

        const pokemonEvolution = processChain(pokemonEvolutionChain.chain)

        console.log(`
Name: ${pokemonData.name}
Number: ${pokemonData.id}
Types: ${pokemonTypes.join(", ")}
Height: ${pokemonData.height / 10} meters
Weight: ${pokemonData.weight / 10} kilograms
Image: ${image}
Abilities: ${pokemonAbilities.join(", ")}
Stats: ${pokemonStats
            .map(([name, value]) => `${name}: ${value}`)
            .join(", ")}
Description: ${pokemonDescription}
Evolutions: ${pokemonEvolution.join(", ")}
`.trim());

    } catch (error) {
        console.error(`Error getting Pokémon: ${error.message}`);
    }
}

getPokemon("charizard");