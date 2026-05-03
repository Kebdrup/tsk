export type TaskItemProps = {
  title: string;
};

export const TaskItem = ({ title }: TaskItemProps) => {
  return (
    <box width={"100%"} flexDirection="row">
      <text width={2} wrapMode="char">
        -
      </text>
      <text flexGrow={1} wrapMode="word">
        {title.trim()}
      </text>
    </box>
  );
};
