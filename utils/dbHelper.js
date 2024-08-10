module.exports.formatMongoData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => formatDocument(item));
  }
  return formatDocument(data);
};

const formatDocument = (doc) => {
  if (doc && typeof doc.toObject === "function") {
    const formatted = doc.toObject();
    for (let key in formatted) {
      if (Array.isArray(formatted[key])) {
        formatted[key] = formatted[key].map((subDoc) => formatDocument(subDoc));
      } else if (formatted[key] && typeof formatted[key] === "object") {
        formatted[key] = formatDocument(formatted[key]);
      }
    }
    // Rename _id to id at this level
    if (formatted._id) {
      formatted.id = formatted._id;
      delete formatted._id;
    }
    return formatted;
  }
  return doc;
};
