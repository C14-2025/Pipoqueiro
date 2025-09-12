import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ onSearch, placeholder = "Buscar filmes...", className = "" }) => {
	const [query, setQuery] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (query.trim()) {
			onSearch(query.trim());
		}
	};

	const clearSearch = () => {
		setQuery('');
	};

	return (
		<div className={`relative ${className}`}>
			<form onSubmit={handleSubmit} role="search">
				<div className={`relative transition-all duration-300 ${
					isExpanded ? 'scale-105' : 'scale-100'
				}`}>
					{/* Search Icon */}
					<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<FiSearch className={`h-5 w-5 transition-colors duration-200 ${
							isExpanded ? 'text-[#00B5AD]' : 'text-[#A0AEC0]'
						}`} />
					</div>
          
					{/* Input */}
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsExpanded(true)}
						onBlur={() => setIsExpanded(false)}
						placeholder={placeholder}
						className={`w-full bg-white border-2 rounded-2xl py-4 pl-12 pr-16 text-[#2D3748] placeholder-[#A0AEC0] 
							focus:outline-none focus:ring-0 transition-all duration-300 ${
							isExpanded 
								? 'border-[#00B5AD] shadow-lg shadow-[#00B5AD]/20' 
								: 'border-gray-200 hover:border-gray-300'
						}`}
					/>
          
					{/* Right Actions */}
					<div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
						{/* Clear Button */}
						{query && (
							<button
								type="button"
								onClick={clearSearch}
								className="p-1 text-[#A0AEC0] hover:text-[#2D3748] rounded-full hover:bg-gray-100 transition-all"
							>
								<FiX className="h-4 w-4" />
							</button>
						)}
            
						{/* Search Button */}
						<button
							type="submit"
							disabled={!query.trim()}
							className="p-2 text-[#A0AEC0] hover:text-[#00B5AD] disabled:opacity-50 disabled:cursor-not-allowed 
								rounded-full hover:bg-gray-100 transition-all"
						>
							<FiSearch className="h-5 w-5" />
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default SearchBar;
