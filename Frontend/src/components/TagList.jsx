/* eslint-disable react/prop-types */
const TagList = ({ items = [], emptyLabel = "Nothing to show" }) => {
  if (!items?.length) {
    return <p className="muted-text">{emptyLabel}</p>;
  }

  return (
    <div className="tag-list">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="tag-chip">
          {item}
        </span>
      ))}
    </div>
  );
};

export default TagList;

