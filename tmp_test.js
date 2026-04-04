const formatName = (str) => {
    if (!str) return '';
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };
  
  const cities = ['bhopal', 'Bhopal', 'Bhopal ', ' Indore ', 'pune', 'Pune'];
  const uniqueCities = ['All', ...new Set(cities.map(item => formatName(item)).filter(Boolean))];
  
  console.log(uniqueCities);
