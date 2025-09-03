const LoadingSpinner = ({ size = "md", className = "" }) => {
	const sizes = {
		sm: "h-8 w-8",
		md: "h-12 w-12", 
		lg: "h-16 w-16"
	};

	return (
		<div className={`flex justify-center items-center ${className}`}>
			<div className={`animate-spin rounded-full border-b-2 border-[#00B5AD] ${sizes[size]}`}></div>
		</div>
	);
};

// Movie Cards Loading Grid
export const MovieGridSkeleton = () => (
	<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
		{[...Array(10)].map((_, i) => (
			<div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg">
				<div className="aspect-[2/3] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
				<div className="p-4 space-y-2">
					<div className="h-4 bg-gray-200 rounded animate-pulse" />
					<div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
				</div>
			</div>
		))}
	</div>
);

export default LoadingSpinner;
