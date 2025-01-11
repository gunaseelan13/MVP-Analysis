import { IdeaAnalysis } from './types';

interface MarketAnalysisContentProps {
  analysis: IdeaAnalysis | undefined;
}

export function MarketAnalysisContent({ analysis }: MarketAnalysisContentProps) {
  if (!analysis) return null;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Similar Apps</h4>
        <div className="space-y-2">
          {analysis.similarApps?.length > 0 ? (
            analysis.similarApps.map((app, j) => (
              <div key={j} className="rounded-md bg-background p-3">
                <p className="text-sm font-medium">{app.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {app.description}
                </p>
                {app.url && (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mt-1 block"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No similar apps found</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Market Potential</h4>
        <div className="rounded-md bg-background p-3">
          <p className="text-sm">
            <span className="font-medium">Size:</span>{' '}
            {analysis.marketPotential?.size || 'Not available'}
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">Growth:</span>{' '}
            {analysis.marketPotential?.growth || 'Not available'}
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium">Opportunities:</p>
            {analysis.marketPotential?.opportunities?.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {analysis.marketPotential.opportunities.map((opp, j) => (
                  <li key={j} className="text-sm text-muted-foreground">
                    {opp}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                No opportunities listed
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Key Differentiators</h4>
        <div className="rounded-md bg-background p-3">
          {analysis.keyDifferentiators?.length > 0 ? (
            <ul className="space-y-1">
              {analysis.keyDifferentiators.map((diff, j) => (
                <li key={j} className="text-sm text-muted-foreground">
                  {diff}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No differentiators listed
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Potential Challenges</h4>
        <div className="rounded-md bg-background p-3">
          {analysis.challenges?.length > 0 ? (
            <ul className="space-y-1">
              {analysis.challenges.map((challenge, j) => (
                <li key={j} className="text-sm text-muted-foreground">
                  {challenge}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No challenges listed</p>
          )}
        </div>
      </div>
    </div>
  );
}
