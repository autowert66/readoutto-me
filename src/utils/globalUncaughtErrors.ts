// add some more details than deno's standard `error: uncaught null`
// when null is thrown instead of an error object
addEventListener('error', (ev) => {
  console.error('uncaught global error:', ev.message);
  console.error(ev);
});
