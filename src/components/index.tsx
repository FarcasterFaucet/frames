export const Container = ({
  children,
  center,
}: {
  children: any;
  center?: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        padding: 30,
        flexDirection: "column",
        alignItems: `${center ? "center" : "flex-start"}`,
        justifyContent: `${center ? "center" : "flex-start"}`,
        gap: 20,
        height: "100%",
        width: "100%",
      }}
    >
      {children}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          fontStyle: "oblique",
          position: "absolute",
          bottom: "5%",
          width: "100%",
          height: "auto",
          fontSize: 25,
          color: "white",
        }}
      >
        powered by: GrabIt
      </div>
    </div>
  );
};

export const Title = ({ title }: { title: string }) => {
  return (
    <div
      style={{
        color: "white",
        fontSize: 80,
        fontWeight: "bold",
      }}
    >
      {title}
    </div>
  );
};
export const Description = ({ description }: { description: string }) => {
  return (
    <div
      style={{
        color: "white",
        fontSize: 35,
        textAlign: "justify",
        textJustify: "distributed",
        fontWeight: "400",
        marginTop: 10,
      }}
    >
      {description}
    </div>
  );
};
