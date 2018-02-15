# Hydria

Hydria is a simple encrypted distributed container to share confidential data among trusted
peers without a central point.

## Usage

Listen to state updates:
```js
const secretKey = 'top-secret-key';

new Hydria(secretKey).await(hydria => {
    hydria.listen(state => {
        console.log(state);
    });
});
```

Publish state updates:
```js
const secretKey = 'top-secret-key';

new Hydria(secretKey).await(hydria => {
    const state = { someObject: "with values" };
    hydria.send(state);
});
```
