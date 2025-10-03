# Calculadora Simples em Python

def calculadora():
    print("=== Calculadora Simples ===")
    print("Operações disponíveis: +  -  *  /")
    
    while True:
        try:
            num1 = float(input("Digite o primeiro número: "))
            operacao = input("Digite a operação (+, -, *, /): ")
            num2 = float(input("Digite o segundo número: "))

            if operacao == "+":
                resultado = num1 + num2
            elif operacao == "-":
                resultado = num1 - num2
            elif operacao == "*":
                resultado = num1 * num2
            elif operacao == "/":
                if num2 != 0:
                    resultado = num1 / num2
                else:
                    print("⚠️ Erro: divisão por zero não é permitida!")
                    continue
            else:
                print("⚠️ Operação inválida!")
                continue

            print(f"Resultado: {resultado}\n")

        except ValueError:
            print("⚠️ Entrada inválida! Digite apenas números.")
        
        continuar = input("Quer fazer outro cálculo? (s/n): ").lower()
        if continuar != "s":
            print("Encerrando calculadora... 👋")
            break

# Executar a calculadora
calculadora()
