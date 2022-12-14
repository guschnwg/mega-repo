import React from 'react';
import './style.css';

const formatMoney = (val) =>
  val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'BRL',
  });

const Table = ({
  months,
  value,
  downPayment,
  interest,
  monthlyInterest,
  amortizations,
}) => {
  let debitBalance = value - downPayment;

  const children = [
    <tr>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>{formatMoney(debitBalance)}</td>
    </tr>,
  ];

  const monthlyAmortization = debitBalance / months;
  let accumulatedAmortizations = 0;
  let accumulatedPayments = 0;
  let accumulatedInterests = 0;
  let accumulatedExtraAmortizations = 0;

  let month = 1;
  while (debitBalance > 0) {
    const extraAmortizations = amortizations
      .filter((a) => month % a.every === 0)
      .map((a) => a.value);

    const installmentInterest = (debitBalance * monthlyInterest) / 100;
    const installmentAmortizations = [monthlyAmortization].concat(
      extraAmortizations
    );

    const installmentPayment = monthlyAmortization + installmentInterest;
    const installmentAmortization = installmentAmortizations.reduce(
      (a, b) => a + b,
      0
    );

    const extraPaymentInInstallment = extraAmortizations.reduce(
      (a, b) => a + b,
      0
    );

    children.push(
      <tr>
        <td>{month}</td>
        <td>
          {formatMoney(installmentPayment)}
          {extraPaymentInInstallment
            ? ` (+ ${formatMoney(extraPaymentInInstallment)})`
            : ''}
        </td>
        <td>{installmentAmortizations.map(formatMoney).join(' + ')}</td>
        <td>{formatMoney(installmentInterest)}</td>
        <td>{formatMoney(debitBalance - installmentAmortization)}</td>
      </tr>
    );

    //
    accumulatedAmortizations += installmentAmortization;
    accumulatedPayments += installmentPayment;
    accumulatedInterests += installmentInterest;
    accumulatedExtraAmortizations += extraAmortizations.reduce(
      (a, b) => a + b,
      0
    );

    debitBalance -= installmentAmortization;

    month += 1;
  }

  children.push(
    <tr>
      <td>Total</td>
      <td>
        {formatMoney(accumulatedPayments)}
        {accumulatedExtraAmortizations
          ? ` (+ ${formatMoney(accumulatedExtraAmortizations)})`
          : ''}
      </td>
      <td>
        {formatMoney(accumulatedAmortizations)} (
        {formatMoney(accumulatedExtraAmortizations)})
      </td>
      <td>{formatMoney(accumulatedInterests)}</td>
      <td></td>
    </tr>,
    <tr>
      <td>Total pago</td>
      <td>
        {formatMoney(accumulatedPayments + accumulatedExtraAmortizations)}
      </td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  );

  return (
    <table>
      <thead>
        <tr>
          <th>M??s</th>
          <th>Parcela</th>
          <th>Amortiza????o</th>
          <th>Juros</th>
          <th>Saldo Devedor</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default function App() {
  const [months, setMonths] = React.useState(120);
  const [value, setValue] = React.useState(439_990);
  const [downPayment, setDownPayment] = React.useState(139_990);
  const [interest, setInterest] = React.useState(8.7);

  const [amortizations, setAmortizations] = React.useState([
    { id: Math.random(), every: 12, value: 2500 },
  ]);

  const monthlyInterest = (Math.pow(1 + interest / 100, 1 / 12) - 1) * 100;

  return (
    <div>
      <div>
        Per??odo{' '}
        <input
          value={months}
          onChange={(event) => setMonths(event.target.value)}
        />
      </div>
      <div>
        Valor Total{' '}
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div>
        Entrada{' '}
        <input
          value={downPayment}
          onChange={(event) => setDownPayment(event.target.value)}
        />
      </div>
      <div>
        Juros anual{' '}
        <input
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
        />
        <div>Juros mensal: {monthlyInterest.toString().slice(0, 4)}%</div>
      </div>

      <div>
        Amortiza????es
        <div>
          {amortizations.map((a) => (
            <div>
              <input
                value={a.every}
                onChange={(event) =>
                  setAmortizations((_prev) => {
                    const prev = [..._prev];
                    const theOne = prev.find((p) => p.id === a.id);
                    theOne.every = parseInt(event.target.value);
                    return prev;
                  })
                }
              />{' '}
              Meses
              <input
                value={a.value}
                onChange={(event) =>
                  setAmortizations((_prev) => {
                    const prev = [..._prev];
                    const theOne = prev.find((p) => p.id === a.id);
                    theOne.value = parseFloat(event.target.value);
                    return prev;
                  })
                }
              />{' '}
              Reais
              <button
                onClick={(event) =>
                  setAmortizations((prev) => prev.filter((p) => p.id !== a.id))
                }
              >
                X
              </button>
            </div>
          ))}
        </div>
        <div>
          <button
            onClick={() =>
              setAmortizations((prev) => [
                ...prev,
                { id: Math.random(), every: 1, value: 0 },
              ])
            }
          >
            +
          </button>
        </div>
      </div>

      <div>
        <Table
          months={months}
          value={value}
          downPayment={downPayment}
          interest={interest}
          monthlyInterest={monthlyInterest}
          amortizations={amortizations}
        />
      </div>
    </div>
  );
}
