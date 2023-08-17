import jwt from "jsonwebtoken";

export const signToken = (_id: string, email: string) => {
  if (!process.env.JWT_SECRET_SEED) {
    throw new Error("NO hay semilla de JWT - Revisar Variables de ENTORNO");
  }

  return jwt.sign(
    //payload
    { _id, email },
    //seed
    process.env.JWT_SECRET_SEED,
    //options
    { expiresIn: "30d" }
  );
};

//validar JWT token 
export const isValidtoken = ( token:string ):Promise<string> => {
  if(!process.env.JWT_SECRET_SEED) {
    throw new Error("NO hay semilla de JWT - Revisar Variabless");
  }

  return new Promise((resolve, reject)  => {
    try {
        jwt.verify( token, process.env.JWT_SECRET_SEED || '', (err, payload) => {
          if (err) return reject('JWT no válido');

          const { _id } = payload as { _id:string };

          resolve(_id)
        })
      
    } catch (e) { 
      reject('JWT no es válido');
    }

  })

}