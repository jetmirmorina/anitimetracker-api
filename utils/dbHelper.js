module.exports.formatMongoData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => item.toObject());
  }
  return data.toObject();
};
