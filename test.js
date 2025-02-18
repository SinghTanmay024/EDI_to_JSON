function findKeyPath(obj, key, path = "") {
    if (typeof obj === "object" && obj !== null) {
      for (const prop in obj) {
        const newPath = path ? `${path}.${prop}` : prop;
  
        if (prop === key) {
          return newPath;
        } else if (typeof obj[prop] === "object" && obj[prop] !== null) {
          const foundPath = findKeyPath(obj[prop], key, newPath);
          if (foundPath) {
            return foundPath;
          }
        }
      }
    }
    return null;
  }
  
  // Example usage
  const data = {
    user: {
      name: "John Doe",
      address: {
        street: "123 Main St",
        city: "Anytown",
      },
    },
    hobbies: ["reading", "coding"],
  };
  
  const keyPath1 = findKeyPath(data, "name"); // returns "user.name"
  const keyPath2 = findKeyPath(data, "city"); // returns "user.address.city"
  const keyPath3 = findKeyPath(data, "nonexistent"); // returns null
  
  console.log(keyPath1); // Output: user.name
  console.log(keyPath2); // Output: user.address.city
  console.log(keyPath3); // Output: null
  