export class MockSupabaseClient {
  auth = {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { /* no-op */ } } } }),
    signUp: () => Promise.resolve({}),
    signInWithPassword: () => Promise.resolve({}),
    signOut: () => Promise.resolve(),
  };

  from = () => ({
    select: () => ({
      eq: () => ({
        data: [],
        error: null,
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () => ({
          data: {},
          error: null,
        }),
      }),
    }),
    delete: () => ({
      eq: () => ({
        error: null,
      }),
    }),
    match: () => ({
        error: null,
    })
  });

  storage = {
    from: () => ({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  };
}
