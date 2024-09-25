import { highlight, Pre, RawCode } from 'codehike/code';
export default async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, 'github-dark');

  if (!highlighted.meta) {
    return <Pre code={highlighted} />;
  }

  return (
    <div className='relative pt-1'>
      <div className='absolute w-full text-center font-bold text-sm'>{highlighted.meta}</div>
      <Pre code={highlighted} />
    </div>
  );
}
