# Placeholder swap hook

Code: [`src/hooks/placeholder.js`](../src/hooks/placeholder.js)

**Rule:** the model only ever sees placeholders (`CUSTOMER_2`). Our code and the database only ever see real names (`Kari Hansen`). The hook sits between them and translates in both directions.

## One question, start to end

```
You type:            "Where does Kari live?"
        │
        ▼  1. BeforeInvocation: real -> placeholder
Model reads:         "Where does CUSTOMER_2 live?"
        │
        ▼  Model decides: call get_customer_details("CUSTOMER_2")
        │
        ▼  2. BeforeToolCall: placeholder -> real
Tool runs with:      "Kari Hansen"      (the database knows no CUSTOMER_2)
        │
        ▼  Database returns: { name: "Kari Hansen", city: "Bergen" }
        │
        ▼  3. AfterToolCall: real -> placeholder
Model reads:         { name: "CUSTOMER_2", city: "Bergen" }
        │
        ▼  Model answers: "CUSTOMER_2 lives in Bergen"
        │
        ▼  4. AfterInvocation: placeholder -> real
You see:             "Kari Hansen lives in Bergen"
```

## Why each swap is needed

| Swap | Direction | Without it |
|---|---|---|
| 1. `BeforeInvocationEvent` | real -> placeholder (towards the model) | The model reads "Kari" in your question |
| 2. `BeforeToolCallEvent` | placeholder -> real (towards the database) | The tool searches for "CUSTOMER_2" and finds nothing |
| 3. `AfterToolCallEvent` | real -> placeholder (towards the model) | The model reads "Kari Hansen" in the tool result |
| 4. `AfterInvocationEvent` | placeholder -> real (towards you) | You get an answer about "CUSTOMER_2" |

Swaps 1 and 3 **hide** names from the model. Swaps 2 and 4 **reveal** them again.

## Privacy hook vs placeholder swap

- The **privacy hook** removes data for good (`[hidden email]`). The model can't use it at all.
- The **placeholder swap** hides data but gives it back later, so the agent can still work with it.

## Limitations

- The built-in printer shows the model's answer while it is written, so you see the placeholder version first and the real-name version after it.
- Only customer names are swapped. Other names, like employee names, are not.

## Try it

```
npm run ask -- "Where does Kari live?"
```
