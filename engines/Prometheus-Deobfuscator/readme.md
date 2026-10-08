# Prometheus Deobfuscator Toolkit

![Python](https://img.shields.io/badge/python-3.12%2B-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Advanced deobfuscation tool for reversing Lua scripts protected by Prometheus Obfuscator / MoonsecV3 / MoonsecV2


### V2 Released
https://github.com/0x251/Prometheus-DeobfuscatorV2

## Features

- Multi-layer polymorphism reversal
- VM structure analysis and devirtualization
- Control flow graph reconstruction
- Hybrid literal decryption (Base64/Hex/Decimal)
- String encryption reversal
- Dynamic payload analysis
- Phase boundary detection
- Anti-debugging countermeasure removal

## Usage
![image](https://github.com/user-attachments/assets/03ed97e0-06d6-44b9-999a-ab43f60921ca)
![image](https://github.com/user-attachments/assets/721f6a96-e8a0-4567-9892-d6d6f82d7755)

```bash
python pol.py obfuscated_script.lua
```

**Example Input:**
```lua
-- PHASE_BOUNDARY:INIT
local bit3c = {[1]=5,positan=4f,global=3j}
-- PHASE_BOUNDARY:VM_1J_BOUNDARY
function = 7; ["\05d"]=3c } local table = math.floor
```


## Supported Obfuscation Techniques

| Technique                | Detection | Reversal |
|--------------------------|-----------|----------|
| Control Flow Flattening  | ✅        | ✅       |
| String Encryption        | ✅        | ✅       |
| VM-Based Execution       | ✅        | ✅       |
| Hybrid Literal Obfuscation| ✅       | ✅       |
| Dynamic GOTO Patterns    | ✅        | ✅       |
| Anti-Tamper Checks       | ✅        | ✅       |
| Metadata Stripping       | ✅        | ❌       |
| String Decryption        | ✅        | ❌       |

## Key Components

1. **Polymorphism Reversal Engine**
   - Phase boundary detection
   - VM structure analysis
   - Dynamic payload tracking


3. **Control Flow Analysis**
   ```python
   class ControlFlowAnalyzer:
       def resolve_dynamic_gotos(self, code):

   ```

## Limitations

- May require manual intervention for:
  - Custom encryption schemes
  - Runtime-packed payloads
  - Environment-specific checks
  - Multi-stage encrypted resources

## Roadmap

- [ ] Automated seed detection
- [ ] Interactive debugging mode
- [ ] Batch processing support


## Contributing

there is still things to add, like XOR seed detection/ and better phase detection.

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Disclaimer:** This tool is intended for educational purposes only. Use responsibly and only on code you have legal rights to modify.
