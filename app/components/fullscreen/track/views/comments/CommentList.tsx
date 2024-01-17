const CommentList = () => {
  return (
    <div className="stack-2 overflow-x-hidden px-2 md:px-0">
      {[...Array(100)].map((_, i) => (
        <p key={i}>oioioi</p>
      ))}
    </div>
  );
};

export default CommentList;
