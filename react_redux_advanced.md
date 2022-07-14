<style>
th, thead {
    border-top:1pt solid;
    border-bottom: 2px solid;
    border-left: none;
    border-right: none;
}
td {
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-left: 1px solid;
    border-right: 1px solid;
}
</style>

# React Redux: Advanced

## <span style="color:lightgreen">Redux & Async Code:</span>

---

Reducers must be pure, side-effect free, and synchronous. So when we have any code that produces a side effect or is asynchronous (like sending an http request), it must NOT go into our reducer functions.

When we have a situation where we need to run such code, we have two main options:

1. Execute the code in the components
1. Create an 'action creator' to allow us to run any asynchronous or side-effect code

### <span style="color:turquoise">Async/Side-Effect Code In Components:</span>
