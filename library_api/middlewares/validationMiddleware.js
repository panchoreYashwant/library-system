exports.validateIssueBook = (req, res, next) => {
  const { memberId, bookId } = req.body;
  if (!memberId || !bookId) return res.status(400).json({ message: 'memberId and bookId required' });
  next();
};

exports.validateReturnBook = (req, res, next) => {
  const { memberId, bookId } = req.body;
  if (!memberId || !bookId) return res.status(400).json({ message: 'memberId and bookId required' });
  next();
};

exports.validateMember = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email required' });
  next();
};
