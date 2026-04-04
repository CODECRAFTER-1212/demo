const allListings = [
    { title: 'Theodolite', city: 'Bhopal', area: 'MP Nagar' }
  ];
  const activeCategory = 'All';
  const activeCity = 'All';
  const activeCampus = 'All';
  const searchTerm = 'bhopal';
  
  const formatName = (str) => {
    if (!str) return '';
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };
  
  const filteredListings = allListings.filter((listing) => {
    const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
    const matchesCity = activeCity === 'All' || formatName(listing.city) === activeCity;
    const matchesCampus = activeCampus === 'All' || formatName(listing.area) === activeCampus;
  
    const isFilterMatch = matchesCategory && matchesCity && matchesCampus;
  
    if (!searchTerm) return isFilterMatch;
  
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = listing.title?.toLowerCase().includes(searchLower) || false;
    const cityMatch = listing.city?.toLowerCase().includes(searchLower) || false;
    const areaMatch = listing.area?.toLowerCase().includes(searchLower) || false;
    const matchesSearch = titleMatch || cityMatch || areaMatch;
  
    return matchesSearch && isFilterMatch;
  });
  
  console.log(filteredListings);
