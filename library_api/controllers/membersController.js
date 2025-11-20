const Member = require('../models/Member');
const Borrowing = require('../models/Borrowing');

module.exports = () => {
  const registerMember = async (req, res) => {
    try {
      const data = req.body;
      const m = new Member(data);
      await m.save();
      return res.status(201).json(m);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  const getMemberDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const member = await Member.findById(id);
      if (!member) return res.status(404).json({ message: 'Member not found' });
      return res.json(member);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  const getBorrowingHistory = async (req, res) => {
    try {
      const { id } = req.params;
      const history = await Borrowing.find({ member_id: id }).populate('book_id');
      return res.json(history);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  return { registerMember, getMemberDetails, getBorrowingHistory };
};
