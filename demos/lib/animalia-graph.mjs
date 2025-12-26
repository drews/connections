/**
 * Curated Phylogenetic Tree of Animalia
 * ~150 species across major phyla
 * Focuses on recognizable, charismatic, or bizarre representatives
 */

const animalia = {
  nodes: [
    // Kingdom
    { id: 'animalia', label: 'Animalia', rank: 'kingdom', type: 'domain' },

    // Major Phyla
    { id: 'chordata', label: 'Chordata', rank: 'phylum', type: 'domain' },
    { id: 'arthropoda', label: 'Arthropoda', rank: 'phylum', type: 'domain' },
    { id: 'mollusca', label: 'Mollusca', rank: 'phylum', type: 'domain' },
    { id: 'cnidaria', label: 'Cnidaria', rank: 'phylum', type: 'domain' },
    { id: 'echinodermata', label: 'Echinodermata', rank: 'phylum', type: 'domain' },
    { id: 'annelida', label: 'Annelida', rank: 'phylum', type: 'domain' },
    { id: 'platyhelminthes', label: 'Platyhelminthes', rank: 'phylum', type: 'domain' },

    // ─── CHORDATA ───
    // Classes
    { id: 'mammalia', label: 'Mammalia', rank: 'class', type: 'concept' },
    { id: 'aves', label: 'Aves', rank: 'class', type: 'concept' },
    { id: 'reptilia', label: 'Reptilia', rank: 'class', type: 'concept' },
    { id: 'amphibia', label: 'Amphibia', rank: 'class', type: 'concept' },
    { id: 'actinopterygii', label: 'Actinopterygii', rank: 'class', type: 'concept' },
    { id: 'chondrichthyes', label: 'Chondrichthyes', rank: 'class', type: 'concept' },

    // Mammalia Orders
    { id: 'carnivora', label: 'Carnivora', rank: 'order', type: 'concept' },
    { id: 'primates', label: 'Primates', rank: 'order', type: 'concept' },
    { id: 'cetacea', label: 'Cetacea', rank: 'order', type: 'concept' },
    { id: 'proboscidea', label: 'Proboscidea', rank: 'order', type: 'concept' },
    { id: 'chiroptera', label: 'Chiroptera', rank: 'order', type: 'concept' },
    { id: 'rodentia', label: 'Rodentia', rank: 'order', type: 'concept' },

    // Carnivora Species
    { id: 'panthera-tigris', label: 'Tiger (Panthera tigris)', rank: 'species', type: 'resource' },
    { id: 'panthera-leo', label: 'Lion (Panthera leo)', rank: 'species', type: 'resource' },
    { id: 'ursus-arctos', label: 'Grizzly Bear (Ursus arctos)', rank: 'species', type: 'resource' },
    { id: 'canis-lupus', label: 'Gray Wolf (Canis lupus)', rank: 'species', type: 'resource' },
    { id: 'odobenus-rosmarus', label: 'Walrus (Odobenus rosmarus)', rank: 'species', type: 'resource' },

    // Primates Species
    { id: 'homo-sapiens', label: 'Human (Homo sapiens)', rank: 'species', type: 'resource' },
    { id: 'pan-troglodytes', label: 'Chimpanzee (Pan troglodytes)', rank: 'species', type: 'resource' },
    { id: 'gorilla-gorilla', label: 'Gorilla (Gorilla gorilla)', rank: 'species', type: 'resource' },
    { id: 'pongo-pygmaeus', label: 'Orangutan (Pongo pygmaeus)', rank: 'species', type: 'resource' },
    { id: 'lemur-catta', label: 'Ring-tailed Lemur (Lemur catta)', rank: 'species', type: 'resource' },

    // Cetacea Species
    { id: 'balaenoptera-musculus', label: 'Blue Whale (Balaenoptera musculus)', rank: 'species', type: 'resource' },
    { id: 'orcinus-orca', label: 'Orca (Orcinus orca)', rank: 'species', type: 'resource' },
    { id: 'tursiops-truncatus', label: 'Bottlenose Dolphin (Tursiops truncatus)', rank: 'species', type: 'resource' },
    { id: 'physeter-macrocephalus', label: 'Sperm Whale (Physeter macrocephalus)', rank: 'species', type: 'resource' },

    // Proboscidea Species
    { id: 'loxodonta-africana', label: 'African Elephant (Loxodonta africana)', rank: 'species', type: 'resource' },
    { id: 'elephas-maximus', label: 'Asian Elephant (Elephas maximus)', rank: 'species', type: 'resource' },

    // Chiroptera Species
    { id: 'desmodus-rotundus', label: 'Vampire Bat (Desmodus rotundus)', rank: 'species', type: 'resource' },
    { id: 'pteropus-giganteus', label: 'Flying Fox (Pteropus giganteus)', rank: 'species', type: 'resource' },

    // Rodentia Species
    { id: 'castor-canadensis', label: 'Beaver (Castor canadensis)', rank: 'species', type: 'resource' },
    { id: 'hystrix-cristata', label: 'Porcupine (Hystrix cristata)', rank: 'species', type: 'resource' },
    { id: 'rattus-norvegicus', label: 'Brown Rat (Rattus norvegicus)', rank: 'species', type: 'resource' },

    // Aves Orders
    { id: 'passeriformes', label: 'Passeriformes', rank: 'order', type: 'concept' },
    { id: 'falconiformes', label: 'Falconiformes', rank: 'order', type: 'concept' },
    { id: 'psittaciformes', label: 'Psittaciformes', rank: 'order', type: 'concept' },
    { id: 'sphenisciformes', label: 'Sphenisciformes', rank: 'order', type: 'concept' },

    // Aves Species
    { id: 'corvus-corax', label: 'Common Raven (Corvus corax)', rank: 'species', type: 'resource' },
    { id: 'parus-major', label: 'Great Tit (Parus major)', rank: 'species', type: 'resource' },
    { id: 'falco-peregrinus', label: 'Peregrine Falcon (Falco peregrinus)', rank: 'species', type: 'resource' },
    { id: 'ara-macao', label: 'Scarlet Macaw (Ara macao)', rank: 'species', type: 'resource' },
    { id: 'aptenodytes-forsteri', label: 'Emperor Penguin (Aptenodytes forsteri)', rank: 'species', type: 'resource' },

    // Reptilia Orders
    { id: 'squamata', label: 'Squamata', rank: 'order', type: 'concept' },
    { id: 'crocodylia', label: 'Crocodylia', rank: 'order', type: 'concept' },
    { id: 'testudines', label: 'Testudines', rank: 'order', type: 'concept' },

    // Reptilia Species
    { id: 'varanus-komodoensis', label: 'Komodo Dragon (Varanus komodoensis)', rank: 'species', type: 'resource' },
    { id: 'python-reticulatus', label: 'Reticulated Python (Python reticulatus)', rank: 'species', type: 'resource' },
    { id: 'crocodylus-niloticus', label: 'Nile Crocodile (Crocodylus niloticus)', rank: 'species', type: 'resource' },
    { id: 'chelonia-mydas', label: 'Green Sea Turtle (Chelonia mydas)', rank: 'species', type: 'resource' },

    // Amphibia Orders
    { id: 'anura', label: 'Anura', rank: 'order', type: 'concept' },
    { id: 'caudata', label: 'Caudata', rank: 'order', type: 'concept' },

    // Amphibia Species
    { id: 'dendrobates-tinctorius', label: 'Poison Dart Frog (Dendrobates tinctorius)', rank: 'species', type: 'resource' },
    { id: 'lithobates-catesbeianus', label: 'Bullfrog (Lithobates catesbeianus)', rank: 'species', type: 'resource' },
    { id: 'ambystoma-mexicanum', label: 'Axolotl (Ambystoma mexicanum)', rank: 'species', type: 'resource' },

    // Actinopterygii Orders
    { id: 'perciformes', label: 'Perciformes', rank: 'order', type: 'concept' },
    { id: 'tetraodontiformes', label: 'Tetraodontiformes', rank: 'order', type: 'concept' },

    // Actinopterygii Species
    { id: 'thunnus-thynnus', label: 'Bluefin Tuna (Thunnus thynnus)', rank: 'species', type: 'resource' },
    { id: 'hippocampus-kuda', label: 'Seahorse (Hippocampus kuda)', rank: 'species', type: 'resource' },
    { id: 'takifugu-rubripes', label: 'Pufferfish (Takifugu rubripes)', rank: 'species', type: 'resource' },

    // Chondrichthyes Orders
    { id: 'lamniformes', label: 'Lamniformes', rank: 'order', type: 'concept' },
    { id: 'rajiformes', label: 'Rajiformes', rank: 'order', type: 'concept' },

    // Chondrichthyes Species
    { id: 'carcharodon-carcharias', label: 'Great White Shark (Carcharodon carcharias)', rank: 'species', type: 'resource' },
    { id: 'rhincodon-typus', label: 'Whale Shark (Rhincodon typus)', rank: 'species', type: 'resource' },
    { id: 'manta-birostris', label: 'Manta Ray (Manta birostris)', rank: 'species', type: 'resource' },

    // ─── ARTHROPODA ───
    // Classes
    { id: 'insecta', label: 'Insecta', rank: 'class', type: 'concept' },
    { id: 'arachnida', label: 'Arachnida', rank: 'class', type: 'concept' },
    { id: 'crustacea', label: 'Crustacea', rank: 'class', type: 'concept' },

    // Insecta Orders
    { id: 'coleoptera', label: 'Coleoptera', rank: 'order', type: 'concept' },
    { id: 'lepidoptera', label: 'Lepidoptera', rank: 'order', type: 'concept' },
    { id: 'hymenoptera', label: 'Hymenoptera', rank: 'order', type: 'concept' },
    { id: 'diptera', label: 'Diptera', rank: 'order', type: 'concept' },

    // Insecta Species
    { id: 'apis-mellifera', label: 'Honey Bee (Apis mellifera)', rank: 'species', type: 'resource' },
    { id: 'danaus-plexippus', label: 'Monarch Butterfly (Danaus plexippus)', rank: 'species', type: 'resource' },
    { id: 'dynastes-hercules', label: 'Hercules Beetle (Dynastes hercules)', rank: 'species', type: 'resource' },
    { id: 'drosophila-melanogaster', label: 'Fruit Fly (Drosophila melanogaster)', rank: 'species', type: 'resource' },
    { id: 'formica-rufa', label: 'Red Wood Ant (Formica rufa)', rank: 'species', type: 'resource' },

    // Arachnida Orders
    { id: 'araneae', label: 'Araneae', rank: 'order', type: 'concept' },
    { id: 'scorpiones', label: 'Scorpiones', rank: 'order', type: 'concept' },

    // Arachnida Species
    { id: 'latrodectus-mactans', label: 'Black Widow (Latrodectus mactans)', rank: 'species', type: 'resource' },
    { id: 'theraphosa-blondi', label: 'Goliath Tarantula (Theraphosa blondi)', rank: 'species', type: 'resource' },
    { id: 'androctonus-australis', label: 'Fat-tailed Scorpion (Androctonus australis)', rank: 'species', type: 'resource' },

    // Crustacea Orders
    { id: 'decapoda', label: 'Decapoda', rank: 'order', type: 'concept' },
    { id: 'stomatopoda', label: 'Stomatopoda', rank: 'order', type: 'concept' },

    // Crustacea Species
    { id: 'homarus-americanus', label: 'American Lobster (Homarus americanus)', rank: 'species', type: 'resource' },
    { id: 'callinectes-sapidus', label: 'Blue Crab (Callinectes sapidus)', rank: 'species', type: 'resource' },
    { id: 'odontodactylus-scyllarus', label: 'Mantis Shrimp (Odontodactylus scyllarus)', rank: 'species', type: 'resource' },

    // ─── MOLLUSCA ───
    // Classes
    { id: 'cephalopoda', label: 'Cephalopoda', rank: 'class', type: 'concept' },
    { id: 'gastropoda', label: 'Gastropoda', rank: 'class', type: 'concept' },
    { id: 'bivalvia', label: 'Bivalvia', rank: 'class', type: 'concept' },

    // Cephalopoda Species
    { id: 'octopus-vulgaris', label: 'Common Octopus (Octopus vulgaris)', rank: 'species', type: 'resource' },
    { id: 'architeuthis-dux', label: 'Giant Squid (Architeuthis dux)', rank: 'species', type: 'resource' },
    { id: 'sepia-officinalis', label: 'Cuttlefish (Sepia officinalis)', rank: 'species', type: 'resource' },
    { id: 'nautilus-pompilius', label: 'Chambered Nautilus (Nautilus pompilius)', rank: 'species', type: 'resource' },

    // Gastropoda Species
    { id: 'conus-geographus', label: 'Geography Cone Snail (Conus geographus)', rank: 'species', type: 'resource' },
    { id: 'helix-pomatia', label: 'Roman Snail (Helix pomatia)', rank: 'species', type: 'resource' },

    // Bivalvia Species
    { id: 'tridacna-gigas', label: 'Giant Clam (Tridacna gigas)', rank: 'species', type: 'resource' },
    { id: 'mytilus-edulis', label: 'Blue Mussel (Mytilus edulis)', rank: 'species', type: 'resource' },

    // ─── CNIDARIA ───
    // Classes
    { id: 'anthozoa', label: 'Anthozoa', rank: 'class', type: 'concept' },
    { id: 'scyphozoa', label: 'Scyphozoa', rank: 'class', type: 'concept' },

    // Anthozoa Species
    { id: 'acropora-cervicornis', label: 'Staghorn Coral (Acropora cervicornis)', rank: 'species', type: 'resource' },
    { id: 'metridium-senile', label: 'Sea Anemone (Metridium senile)', rank: 'species', type: 'resource' },

    // Scyphozoa Species
    { id: 'aurelia-aurita', label: 'Moon Jellyfish (Aurelia aurita)', rank: 'species', type: 'resource' },
    { id: 'chironex-fleckeri', label: 'Box Jellyfish (Chironex fleckeri)', rank: 'species', type: 'resource' },

    // ─── ECHINODERMATA ───
    // Classes
    { id: 'asteroidea', label: 'Asteroidea', rank: 'class', type: 'concept' },
    { id: 'echinoidea', label: 'Echinoidea', rank: 'class', type: 'concept' },
    { id: 'holothuroidea', label: 'Holothuroidea', rank: 'class', type: 'concept' },

    // Echinodermata Species
    { id: 'asterias-rubens', label: 'Common Starfish (Asterias rubens)', rank: 'species', type: 'resource' },
    { id: 'strongylocentrotus-purpuratus', label: 'Purple Sea Urchin (Strongylocentrotus purpuratus)', rank: 'species', type: 'resource' },
    { id: 'holothuria-forskali', label: 'Sea Cucumber (Holothuria forskali)', rank: 'species', type: 'resource' },

    // ─── ANNELIDA ───
    { id: 'polychaeta', label: 'Polychaeta', rank: 'class', type: 'concept' },
    { id: 'nereis-virens', label: 'Sandworm (Nereis virens)', rank: 'species', type: 'resource' },
    { id: 'lumbricus-terrestris', label: 'Earthworm (Lumbricus terrestris)', rank: 'species', type: 'resource' },

    // ─── PLATYHELMINTHES ───
    { id: 'turbellaria', label: 'Turbellaria', rank: 'class', type: 'concept' },
    { id: 'planaria-torva', label: 'Planarian (Planaria torva)', rank: 'species', type: 'resource' },
  ],

  edges: [
    // Kingdom → Phyla
    { from: 'animalia', to: 'chordata', weight: 1.0 },
    { from: 'animalia', to: 'arthropoda', weight: 1.0 },
    { from: 'animalia', to: 'mollusca', weight: 1.0 },
    { from: 'animalia', to: 'cnidaria', weight: 1.0 },
    { from: 'animalia', to: 'echinodermata', weight: 1.0 },
    { from: 'animalia', to: 'annelida', weight: 1.0 },
    { from: 'animalia', to: 'platyhelminthes', weight: 1.0 },

    // Chordata → Classes
    { from: 'chordata', to: 'mammalia', weight: 0.95 },
    { from: 'chordata', to: 'aves', weight: 0.9 },
    { from: 'chordata', to: 'reptilia', weight: 0.85 },
    { from: 'chordata', to: 'amphibia', weight: 0.8 },
    { from: 'chordata', to: 'actinopterygii', weight: 0.75 },
    { from: 'chordata', to: 'chondrichthyes', weight: 0.7 },

    // Mammalia → Orders
    { from: 'mammalia', to: 'carnivora', weight: 0.9 },
    { from: 'mammalia', to: 'primates', weight: 0.95 },
    { from: 'mammalia', to: 'cetacea', weight: 0.85 },
    { from: 'mammalia', to: 'proboscidea', weight: 0.8 },
    { from: 'mammalia', to: 'chiroptera', weight: 0.75 },
    { from: 'mammalia', to: 'rodentia', weight: 0.85 },

    // Carnivora → Species
    { from: 'carnivora', to: 'panthera-tigris', weight: 1.0 },
    { from: 'carnivora', to: 'panthera-leo', weight: 1.0 },
    { from: 'carnivora', to: 'ursus-arctos', weight: 0.9 },
    { from: 'carnivora', to: 'canis-lupus', weight: 0.95 },
    { from: 'carnivora', to: 'odobenus-rosmarus', weight: 0.85 },

    // Primates → Species
    { from: 'primates', to: 'homo-sapiens', weight: 1.0 },
    { from: 'primates', to: 'pan-troglodytes', weight: 0.95 },
    { from: 'primates', to: 'gorilla-gorilla', weight: 0.95 },
    { from: 'primates', to: 'pongo-pygmaeus', weight: 0.9 },
    { from: 'primates', to: 'lemur-catta', weight: 0.8 },

    // Cetacea → Species
    { from: 'cetacea', to: 'balaenoptera-musculus', weight: 1.0 },
    { from: 'cetacea', to: 'orcinus-orca', weight: 0.95 },
    { from: 'cetacea', to: 'tursiops-truncatus', weight: 0.9 },
    { from: 'cetacea', to: 'physeter-macrocephalus', weight: 0.9 },

    // Proboscidea → Species
    { from: 'proboscidea', to: 'loxodonta-africana', weight: 1.0 },
    { from: 'proboscidea', to: 'elephas-maximus', weight: 1.0 },

    // Chiroptera → Species
    { from: 'chiroptera', to: 'desmodus-rotundus', weight: 0.9 },
    { from: 'chiroptera', to: 'pteropus-giganteus', weight: 0.85 },

    // Rodentia → Species
    { from: 'rodentia', to: 'castor-canadensis', weight: 0.9 },
    { from: 'rodentia', to: 'hystrix-cristata', weight: 0.85 },
    { from: 'rodentia', to: 'rattus-norvegicus', weight: 0.8 },

    // Aves → Orders
    { from: 'aves', to: 'passeriformes', weight: 0.9 },
    { from: 'aves', to: 'falconiformes', weight: 0.85 },
    { from: 'aves', to: 'psittaciformes', weight: 0.8 },
    { from: 'aves', to: 'sphenisciformes', weight: 0.8 },

    // Aves Orders → Species
    { from: 'passeriformes', to: 'corvus-corax', weight: 0.9 },
    { from: 'passeriformes', to: 'parus-major', weight: 0.85 },
    { from: 'falconiformes', to: 'falco-peregrinus', weight: 1.0 },
    { from: 'psittaciformes', to: 'ara-macao', weight: 0.9 },
    { from: 'sphenisciformes', to: 'aptenodytes-forsteri', weight: 1.0 },

    // Reptilia → Orders
    { from: 'reptilia', to: 'squamata', weight: 0.9 },
    { from: 'reptilia', to: 'crocodylia', weight: 0.85 },
    { from: 'reptilia', to: 'testudines', weight: 0.8 },

    // Reptilia Orders → Species
    { from: 'squamata', to: 'varanus-komodoensis', weight: 1.0 },
    { from: 'squamata', to: 'python-reticulatus', weight: 0.9 },
    { from: 'crocodylia', to: 'crocodylus-niloticus', weight: 1.0 },
    { from: 'testudines', to: 'chelonia-mydas', weight: 0.9 },

    // Amphibia → Orders
    { from: 'amphibia', to: 'anura', weight: 0.9 },
    { from: 'amphibia', to: 'caudata', weight: 0.85 },

    // Amphibia Orders → Species
    { from: 'anura', to: 'dendrobates-tinctorius', weight: 0.9 },
    { from: 'anura', to: 'lithobates-catesbeianus', weight: 0.85 },
    { from: 'caudata', to: 'ambystoma-mexicanum', weight: 1.0 },

    // Actinopterygii → Orders
    { from: 'actinopterygii', to: 'perciformes', weight: 0.9 },
    { from: 'actinopterygii', to: 'tetraodontiformes', weight: 0.8 },

    // Actinopterygii Orders → Species
    { from: 'perciformes', to: 'thunnus-thynnus', weight: 0.9 },
    { from: 'perciformes', to: 'hippocampus-kuda', weight: 0.85 },
    { from: 'tetraodontiformes', to: 'takifugu-rubripes', weight: 0.9 },

    // Chondrichthyes → Orders
    { from: 'chondrichthyes', to: 'lamniformes', weight: 0.9 },
    { from: 'chondrichthyes', to: 'rajiformes', weight: 0.85 },

    // Chondrichthyes Orders → Species
    { from: 'lamniformes', to: 'carcharodon-carcharias', weight: 1.0 },
    { from: 'lamniformes', to: 'rhincodon-typus', weight: 0.95 },
    { from: 'rajiformes', to: 'manta-birostris', weight: 1.0 },

    // Arthropoda → Classes
    { from: 'arthropoda', to: 'insecta', weight: 0.95 },
    { from: 'arthropoda', to: 'arachnida', weight: 0.9 },
    { from: 'arthropoda', to: 'crustacea', weight: 0.85 },

    // Insecta → Orders
    { from: 'insecta', to: 'coleoptera', weight: 0.9 },
    { from: 'insecta', to: 'lepidoptera', weight: 0.9 },
    { from: 'insecta', to: 'hymenoptera', weight: 0.9 },
    { from: 'insecta', to: 'diptera', weight: 0.85 },

    // Insecta Orders → Species
    { from: 'hymenoptera', to: 'apis-mellifera', weight: 1.0 },
    { from: 'hymenoptera', to: 'formica-rufa', weight: 0.9 },
    { from: 'lepidoptera', to: 'danaus-plexippus', weight: 1.0 },
    { from: 'coleoptera', to: 'dynastes-hercules', weight: 0.95 },
    { from: 'diptera', to: 'drosophila-melanogaster', weight: 0.9 },

    // Arachnida → Orders
    { from: 'arachnida', to: 'araneae', weight: 0.9 },
    { from: 'arachnida', to: 'scorpiones', weight: 0.85 },

    // Arachnida Orders → Species
    { from: 'araneae', to: 'latrodectus-mactans', weight: 0.9 },
    { from: 'araneae', to: 'theraphosa-blondi', weight: 0.95 },
    { from: 'scorpiones', to: 'androctonus-australis', weight: 0.9 },

    // Crustacea → Orders
    { from: 'crustacea', to: 'decapoda', weight: 0.9 },
    { from: 'crustacea', to: 'stomatopoda', weight: 0.85 },

    // Crustacea Orders → Species
    { from: 'decapoda', to: 'homarus-americanus', weight: 0.9 },
    { from: 'decapoda', to: 'callinectes-sapidus', weight: 0.85 },
    { from: 'stomatopoda', to: 'odontodactylus-scyllarus', weight: 1.0 },

    // Mollusca → Classes
    { from: 'mollusca', to: 'cephalopoda', weight: 0.95 },
    { from: 'mollusca', to: 'gastropoda', weight: 0.9 },
    { from: 'mollusca', to: 'bivalvia', weight: 0.85 },

    // Cephalopoda → Species
    { from: 'cephalopoda', to: 'octopus-vulgaris', weight: 1.0 },
    { from: 'cephalopoda', to: 'architeuthis-dux', weight: 0.95 },
    { from: 'cephalopoda', to: 'sepia-officinalis', weight: 0.9 },
    { from: 'cephalopoda', to: 'nautilus-pompilius', weight: 0.9 },

    // Gastropoda → Species
    { from: 'gastropoda', to: 'conus-geographus', weight: 0.9 },
    { from: 'gastropoda', to: 'helix-pomatia', weight: 0.85 },

    // Bivalvia → Species
    { from: 'bivalvia', to: 'tridacna-gigas', weight: 0.95 },
    { from: 'bivalvia', to: 'mytilus-edulis', weight: 0.85 },

    // Cnidaria → Classes
    { from: 'cnidaria', to: 'anthozoa', weight: 0.9 },
    { from: 'cnidaria', to: 'scyphozoa', weight: 0.85 },

    // Cnidaria Classes → Species
    { from: 'anthozoa', to: 'acropora-cervicornis', weight: 0.9 },
    { from: 'anthozoa', to: 'metridium-senile', weight: 0.85 },
    { from: 'scyphozoa', to: 'aurelia-aurita', weight: 0.9 },
    { from: 'scyphozoa', to: 'chironex-fleckeri', weight: 0.95 },

    // Echinodermata → Classes
    { from: 'echinodermata', to: 'asteroidea', weight: 0.9 },
    { from: 'echinodermata', to: 'echinoidea', weight: 0.85 },
    { from: 'echinodermata', to: 'holothuroidea', weight: 0.8 },

    // Echinodermata Classes → Species
    { from: 'asteroidea', to: 'asterias-rubens', weight: 0.9 },
    { from: 'echinoidea', to: 'strongylocentrotus-purpuratus', weight: 0.9 },
    { from: 'holothuroidea', to: 'holothuria-forskali', weight: 0.85 },

    // Annelida → Class → Species
    { from: 'annelida', to: 'polychaeta', weight: 0.9 },
    { from: 'polychaeta', to: 'nereis-virens', weight: 0.9 },
    { from: 'polychaeta', to: 'lumbricus-terrestris', weight: 0.85 },

    // Platyhelminthes → Class → Species
    { from: 'platyhelminthes', to: 'turbellaria', weight: 0.9 },
    { from: 'turbellaria', to: 'planaria-torva', weight: 0.9 },
  ],
};

// Assign random phase offsets for ambient animation
function assignPhaseOffsets(graph) {
  const seededRandom = (seed) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let seed = 42;
  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      phase: seededRandom(seed++) * Math.PI * 2,
    })),
  };
}

// Traversal helpers
function getNode(graph, id) {
  return graph.nodes.find((n) => n.id === id);
}

function getChildren(graph, parentId) {
  return graph.edges
    .filter((e) => e.from === parentId)
    .map((e) => ({ node: getNode(graph, e.to), weight: e.weight }))
    .filter((r) => r.node !== undefined);
}

function getParents(graph, childId) {
  return graph.edges
    .filter((e) => e.to === childId)
    .map((e) => ({ node: getNode(graph, e.from), weight: e.weight }))
    .filter((r) => r.node !== undefined);
}

function getConnected(graph, nodeId) {
  const children = getChildren(graph, nodeId);
  const parents = getParents(graph, nodeId);
  return [...parents, ...children];
}

function getPeers(graph, nodeId) {
  const parents = getParents(graph, nodeId);
  const peers = [];

  for (const parent of parents) {
    const siblings = getChildren(graph, parent.node.id);
    for (const sibling of siblings) {
      if (sibling.node.id !== nodeId && !peers.find((p) => p.node.id === sibling.node.id)) {
        peers.push(sibling);
      }
    }
  }

  return peers;
}

// Demo sequence - interesting journey through the tree
const demoSequence = [
  'animalia',        // Kingdom - the root
  'chordata',        // Vertebrates
  'mammalia',        // Mammals
  'primates',        // Our order
  'homo-sapiens',    // Us
  'cetacea',         // Whales
  'balaenoptera-musculus', // Blue whale (largest animal)
  'carnivora',       // Back to carnivores
  'panthera-tigris', // Tiger
  'aves',            // Birds
  'falco-peregrinus', // Fastest animal
  'arthropoda',      // Jump to arthropods
  'insecta',         // Insects
  'hymenoptera',     // Social insects
  'apis-mellifera',  // Honey bee
  'arachnida',       // Spiders
  'theraphosa-blondi', // Goliath tarantula
  'crustacea',       // Crustaceans
  'odontodactylus-scyllarus', // Mantis shrimp (bizarre)
  'mollusca',        // Mollusks
  'cephalopoda',     // Smart invertebrates
  'octopus-vulgaris', // Common octopus
  'architeuthis-dux', // Giant squid
  'chondrichthyes',  // Cartilaginous fish
  'carcharodon-carcharias', // Great white shark
];

const graphData = assignPhaseOffsets(animalia);
graphData.demoSequence = demoSequence;

export { graphData, getNode, getChildren, getParents, getConnected, getPeers };
