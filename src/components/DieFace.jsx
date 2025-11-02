const DieFace = ({ colour, onPlayerBehaviour, isDisabled = false, props }) => {
  return (
    <button
      className={`die ${colour.name}`}
      data-colour={colour.hex}
      data-groupid={props.groupId}
      data-rollid={props.rollId}
      data-value={props.value}
      onClick={onPlayerBehaviour}
      disabled={isDisabled}
    >
      <span className="face">
        <span className="pip"></span>
        <span className="pip"></span>
        <span className="pip"></span>
        <span className="pip"></span>
        <span className="pip"></span>
        <span className="pip"></span>
      </span>
    </button>
  );
};

export default DieFace;
