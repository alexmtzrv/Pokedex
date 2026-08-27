const apiURL = "https://pokeapi.co/api/v2";

async function getPokemon(name) {
    try {
        const pokemonResponse = await fetch(`${apiURL}/pokemon/${name.toLowerCase()}`);

        if (!pokemonResponse.ok) {
            throw new Error(`Could not fetch Pokémon ${pokemonResponse.status}: ${pokemonResponse.statusText}`);
        }

        const pokemonData = await pokemonResponse.json();

        const pokemonTypes = []
        for (const types of pokemonData.types) {
            pokemonTypes.push(types.type.name);
        }

        const pokemonAbilities = []
        for (const ability of pokemonData.abilities) {
            pokemonAbilities.push(ability.ability.name);
        }

        const pokemonStats = []
        for (const stat of pokemonData.stats) {
            pokemonStats.push([stat.stat.name, stat.base_stat]);
        }

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
        const pokemonEvolvesTo=[]
        for (const evolution of pokemonEvolutionChain.chain.evolves_to) {
            pokemonEvolvesTo.push(evolution.species.name)
        }

        console.log(`
        Name:${pokemonData.name} | 
        Number:${pokemonData.id} | 
        Types:${pokemonTypes} | 
        Height:${pokemonData.height} decimeters |
        Weight:${pokemonData.weight} hectograms |
        Image:${pokemonData.sprites.front_default} |
        Abilities:${pokemonAbilities} |
        Stats:${pokemonStats} |
        Description:${pokemonDescription} |
        Evolutions:${pokemonEvolvesTo}`);

    } catch (error) {
        console.error(`Error getting Pokémon: ${error.message}`);
    }
}

getPokemon("pichu");