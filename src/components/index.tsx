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
        height: "100%",
        width: "100%",
        alignItems: "center",
        backgroundImage: "linear-gradient(to bottom, #dbf4ff, #fff1f1)",
        justifyContent: "center",
        letterSpacing: "-.02em",
        fontWeight: 700,
        background: "white",
      }}
    >
      <div
        style={{
          left: 42,
          top: 42,
          position: "absolute",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            background: "black",
          }}
        />

        <span
          style={{
            marginLeft: 8,
            fontSize: 40,
          }}
        >
          claimr
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "20px 50px",
          margin: "0 42px",
          fontSize: 40,
          width: "auto",
          maxWidth: "80%",
          borderRadius: 20,
          textAlign: "center",
          backgroundColor: "none",
          color: "white",
          lineHeight: 1.4,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const ContainerItem = ({ data }: { data: string }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "20px 50px",
        margin: "0 42px",
        fontSize: 40,
        width: "auto",
        maxWidth: "90%",
        borderRadius: 20,
        textAlign: "justify",
        backgroundColor: "white",
        boxShadow: "10px 10px 5px",
        color: "black",
        lineHeight: 1.4,
      }}
    >
      {data}
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
