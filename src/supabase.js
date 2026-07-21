const getToken = () => localStorage.getItem("token");

export const supabaseConfigurado = true;

class MockQuery {
  constructor(table) {
    this.table = table;
    this.method = "GET";
    this.body = null;
    this.url = `/api/${table}`;
  }
  select() { this.method = "GET"; return this; }
  order() { return this; } // Ignorado pois o backend já ordena
  insert(data) { this.method = "POST"; this.body = data; return this; }
  update(data) { this.method = "PUT"; this.body = data; return this; }
  delete() { this.method = "DELETE"; return this; }
  eq(field, value) {
    if (this.method === "PUT" || this.method === "DELETE") {
      this.url = `/api/${this.table}/${value}`;
    }
    return this;
  }
  async then(resolve, reject) {
    try {
      const res = await fetch(this.url, {
        method: this.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: this.body ? JSON.stringify(this.body) : undefined
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        resolve({ data: null, error: data.error || "Erro desconhecido" });
        return;
      }
      
      resolve({ data: data.data, error: null });
    } catch (e) {
      resolve({ data: null, error: e });
    }
  }
}

export const supabase = {
  from: (table) => new MockQuery(table),
  auth: {
    signInWithPassword: async ({ email, password }) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.error) return { error: data.error };
        localStorage.setItem("token", data.session.access_token);
        return { data };
      } catch (e) {
        return { error: e.message };
      }
    },
    getSession: async () => {
      const token = getToken();
      if (!token) return { data: { session: null } };
      try {
        const res = await fetch('/api/auth/session', {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.error) return { data: { session: null } };
        return { data: { session: { user: data.session.user } } };
      } catch (e) {
        return { data: { session: null } };
      }
    },
    signOut: async () => {
      localStorage.removeItem("token");
      return { error: null };
    }
  }
};
